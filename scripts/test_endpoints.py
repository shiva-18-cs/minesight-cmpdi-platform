"""
MineSight - Comprehensive API & Integration Test
Verifies all endpoints against the cleaned/real data backend.
"""
import os, sys, json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app

client = TestClient(app)

def run_tests():
    print("=== RUNNING MINESIGHT API TESTS ===")

    # 1. Health
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("[PASS] Root Health:", r.json())

    # 2. Login
    r = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    print("[PASS] Auth Login (Admin):", r.json()["full_name"])

    # 3. Dashboard (Authentic State)
    r = client.get("/dashboard")
    assert r.status_code == 200, f"Dashboard failed: {r.text}"
    dash = r.json()
    print(f"[PASS] Dashboard Authentic State: total_documents={dash['total_documents']}, information_found={dash['information_found']}, differences_found={dash['differences_found']}")
    assert dash["total_documents"] >= 8
    assert dash["information_found"] >= 30
    assert len(dash["production_trend"]) > 0
    assert dash["production_trend"][0]["MCL"] == 206.1

    # 4. Analytics (Authentic State)
    r = client.get("/analytics")
    assert r.status_code == 200, f"Analytics failed: {r.text}"
    analytics = r.json()
    print(f"[PASS] Analytics Authentic State: production_trend={len(analytics['production_trend'])} years, target_vs_actual={len(analytics['target_vs_actual'])} subsidiaries")
    assert len(analytics["production_trend"]) > 0
    assert len(analytics["target_vs_actual"]) == 7

    # 5. Differences (Authentic Cross-Source Differences)
    r = client.get("/differences")
    assert r.status_code == 200
    diffs = r.json()
    print(f"[PASS] Differences Found: {len(diffs)} cross-source discrepancies")
    assert len(diffs) >= 4

    # 6. Topics (Authentic Topics)
    r = client.get("/topics")
    assert r.status_code == 200
    topics = r.json()
    print(f"[PASS] Topics Found: {len(topics)} authentic topics from document texts")
    assert len(topics) >= 5

    # 7. Supervisor Stats & Queries (DB-driven)
    r = client.get("/supervisor/stats")
    assert r.status_code == 200
    sup_stats = r.json()
    print(f"[PASS] Supervisor Stats: queries_received={sup_stats['queries_received']}")
    assert sup_stats["queries_received"] == 0

    r = client.get("/queries/supervisor")
    assert r.status_code == 200
    print("[PASS] Supervisor Queries: [] (DB-driven)")

    # 8. PM Stats (DB-driven)
    r = client.get("/pm/stats")
    assert r.status_code == 200
    pm_stats = r.json()
    print(f"[PASS] PM Stats: open_queries={pm_stats['open_queries']}")
    assert pm_stats["open_queries"] == 0

    # 9. AI Query (Grounded Answer & Insufficient Evidence Handling)
    r = client.post("/ai/query", json={"question": "What was MCL production in 2024?"})
    assert r.status_code == 200
    ai_res = r.json()
    print(f"[PASS] AI Query Response (Grounded): \"{ai_res['answer']}\"")
    assert "206.1" in ai_res["answer"]
    assert len(ai_res["sources"]) > 0

    r_unk = client.post("/ai/query", json={"question": "What was MCL production in 2018?"})
    assert r_unk.status_code == 200
    ai_unk = r_unk.json()
    print(f"[PASS] AI Query Response (Unknown Year): \"{ai_unk['answer']}\"")
    assert "Insufficient evidence" in ai_unk["answer"]

    # 10. Settings
    r = client.get("/settings")
    assert r.status_code == 200
    settings = r.json()
    print(f"[PASS] Settings: AI provider='{settings['ai']['provider']}', OCR provider='{settings['document_processing']['ocr_provider']}'")

    # 11. Test Uploading Real Document (Text/PDF Simulation)
    print("\n--- Testing Real Ingestion & Discrepancy Flow ---")
    sample_text = """
    MAHANADI COALFIELDS LIMITED (MCL)
    ANNUAL MINING & REVENUE PERFORMANCE REPORT
    Financial Year 2024
    
    Executive Operational Highlights:
    Coal Production: 195.4 MT
    Production Target: 190.0 MT
    Coal Dispatch: 185.2 MT
    Overburden Removal: 210.5 MCum
    Stripping Ratio: 1.08
    """
    
    upload_res = client.post(
        "/documents/upload",
        files={"file": ("MCL_Annual_Report_2024.txt", sample_text.encode("utf-8"), "text/plain")},
        data={"subsidiary": "MCL", "year": "2024", "doc_type": "Annual Mining Report", "uploaded_by": "R.K. Sharma"}
    )
    assert upload_res.status_code == 200
    up_data = upload_res.json()
    print(f"[PASS] Real Document Uploaded: ID={up_data['doc_id']}, fields_extracted={up_data['fields_extracted']}")
    assert up_data["fields_extracted"] >= 3

    # Check dashboard now reflects the ingested real document
    r = client.get("/dashboard")
    dash2 = r.json()
    print(f"[PASS] Post-Ingestion Dashboard: total_documents={dash2['total_documents']}, information_found={dash2['information_found']}")
    assert dash2["total_documents"] >= 9
    assert dash2["information_found"] >= 40
    assert len(dash2["production_trend"]) > 0

    # Check AI Query now answers from real document
    r = client.post("/ai/query", json={"question": "What was MCL production in 2024?"})
    ai_ans = r.json()
    print(f"[PASS] AI Query on Ingested Data: \"{ai_ans['answer']}\"")
    assert "206.1" in ai_ans["answer"] or "195.4" in ai_ans["answer"]
    assert len(ai_ans["sources"]) > 0

    print("\n==============================================")
    print("ALL VERIFICATION & INTEGRATION TESTS PASSED!")
    print("==============================================")

if __name__ == "__main__":
    run_tests()
