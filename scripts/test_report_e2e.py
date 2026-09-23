import urllib.request
import urllib.parse
import json
import os
import sys

API = "http://localhost:8000"

def test_report_lifecycle():
    print("=== STARTING REPORT LIFECYCLE E2E TEST ===")
    
    # 1. Generate Report
    gen_payload = {
        "title": "CIL_Provisional_Production_Report_FY24.csv - Final Project Report",
        "report_type": "Final Project Report",
        "subsidiary": "MCL",
        "year": 2024,
        "created_by": "Project Manager"
    }
    
    req = urllib.request.Request(
        f"{API}/reports/generate",
        data=json.dumps(gen_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        gen_data = json.loads(resp.read().decode("utf-8"))
    
    report_id = gen_data["id"]
    report_code = gen_data["report_id"]
    print(f"[PASS] 1. Report Generated successfully: id={report_id}, code={report_code}, title='{gen_data['title']}'")
    
    # Check sections in generated response
    content = gen_data.get("content", {})
    sections = content.get("sections", [])
    section_titles = [s["title"] for s in sections]
    print(f"Generated sections: {section_titles}")
    assert "Executive Summary" in section_titles or content.get("executive_summary")
    assert "Project Information" in section_titles
    assert "Production Information" in section_titles
    assert "Mining Information" in section_titles
    assert "Geological Information" in section_titles
    assert "Key Findings" in section_titles
    print(f"[PASS] All 6 Authentic Report Sections present in generated report")

    # 2. Get Report Detail by Integer ID
    with urllib.request.urlopen(f"{API}/reports/{report_id}") as resp:
        assert resp.status == 200
        rep_detail = json.loads(resp.read().decode("utf-8"))
        assert rep_detail["id"] == report_id
        assert rep_detail["title"] == gen_payload["title"]
    print(f"[PASS] 2. GET /reports/{report_id} retrieved successfully")

    # 3. Get Report Detail by Code
    with urllib.request.urlopen(f"{API}/reports/{report_code}") as resp:
        assert resp.status == 200
        rep_detail_code = json.loads(resp.read().decode("utf-8"))
        assert rep_detail_code["id"] == report_id
    print(f"[PASS] 3. GET /reports/{report_code} (by code) retrieved successfully")

    # 4. Download PDF via /reports/{report_id}/pdf
    with urllib.request.urlopen(f"{API}/reports/{report_id}/pdf") as resp:
        assert resp.status == 200
        content_type = resp.headers.get("Content-Type")
        content_disp = resp.headers.get("Content-Disposition")
        pdf_bytes = resp.read()
        
        print(f"PDF Content-Type: {content_type}")
        print(f"PDF Content-Disposition: {content_disp}")
        print(f"PDF Byte Length: {len(pdf_bytes)}")
        
        assert "application/pdf" in content_type, f"Expected application/pdf, got {content_type}"
        assert pdf_bytes.startswith(b"%PDF"), f"Expected %PDF header, got {pdf_bytes[:10]}"
        assert len(pdf_bytes) > 2000, f"PDF seems too small: {len(pdf_bytes)} bytes"
        assert ".pdf" in (content_disp or "").lower()
    print(f"[PASS] 4. GET /reports/{report_id}/pdf returned valid PDF artifact ({len(pdf_bytes)} bytes)")

    # 5. Download PDF via /reports/{report_id}/export/pdf
    with urllib.request.urlopen(f"{API}/reports/{report_id}/export/pdf") as resp:
        assert resp.status == 200
        content_type = resp.headers.get("Content-Type")
        pdf_bytes2 = resp.read()
        assert "application/pdf" in content_type
        assert pdf_bytes2.startswith(b"%PDF")
    print(f"[PASS] 5. GET /reports/{report_id}/export/pdf returned valid PDF artifact")

    # 6. Test Non-existent Report PDF returns 404
    try:
        urllib.request.urlopen(f"{API}/reports/999999/pdf")
        assert False, "Should have raised 404"
    except urllib.error.HTTPError as e:
        assert e.code == 404
        print(f"[PASS] 6. GET /reports/999999/pdf correctly returned HTTP 404")

    # 7. Submit Report to Administrator
    submit_payload = {
        "submitted_by": "Project Manager"
    }
    req_sub = urllib.request.Request(
        f"{API}/reports/{report_id}/submit",
        data=json.dumps(submit_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="PUT"
    )
    with urllib.request.urlopen(req_sub) as resp:
        assert resp.status == 200
        sub_data = json.loads(resp.read().decode("utf-8"))
        assert sub_data["status"] == "Submitted to Administrator"
        assert sub_data["submitted_by"] == "Project Manager"
    print(f"[PASS] 7. PUT /reports/{report_id}/submit updated status to 'Submitted to Administrator'")

    # 8. Verify status is persisted in GET /reports/{report_id}
    with urllib.request.urlopen(f"{API}/reports/{report_id}") as resp:
        assert resp.status == 200
        rep_after_sub = json.loads(resp.read().decode("utf-8"))
        assert rep_after_sub["status"] == "Submitted to Administrator"
    print(f"[PASS] 8. Report status persistence verified after submission")

    print("\n==========================================")
    print("ALL 8 REPORT LIFECYCLE TESTS PASSED (100%)")
    print("==========================================")

if __name__ == "__main__":
    test_report_lifecycle()
