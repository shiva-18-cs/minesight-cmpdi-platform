"""
MineSight Backend - Complete FastAPI Application
All routes for the mining & reporting intelligence platform.
"""
import os, json, io, csv
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc

from .database import engine, Base, get_db
from .models.domain import (
    User, Subsidiary, Mine, Document, DocumentText, ExtractedInformation,
    DataCheck, Difference, Topic, Report, AIQuestion, Notification, ActivityHistory,
    AdminQuery
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MineSight API", description="Mining & Reporting Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# PRODUCTION DATA (consistent across the app)
# ──────────────────────────────────────────────
PRODUCTION = {
    "MCL":  {2020:148,2021:157,2022:168,2023:176,2024:182,2025:190},
    "WCL":  {2020:46,2021:48,2022:51,2023:52,2024:55,2025:57},
    "NCL":  {2020:108,2021:112,2022:118,2023:120,2024:124,2025:128},
    "SECL": {2020:140,2021:145,2022:150,2023:155,2024:160,2025:165},
    "CCL":  {2020:70,2021:72,2022:75,2023:78,2024:80,2025:82},
    "BCCL": {2020:32,2021:33,2022:35,2023:36,2024:38,2025:40},
    "ECL":  {2020:38,2021:39,2022:40,2023:41,2024:43,2025:45},
}
TARGETS = {
    "MCL":  {2020:145,2021:155,2022:165,2023:175,2024:180,2025:188},
    "WCL":  {2020:48,2021:50,2022:52,2023:54,2024:56,2025:58},
    "NCL":  {2020:110,2021:115,2022:120,2023:122,2024:126,2025:130},
    "SECL": {2020:138,2021:142,2022:148,2023:153,2024:158,2025:163},
    "CCL":  {2020:72,2021:74,2022:76,2023:80,2024:82,2025:84},
    "BCCL": {2020:34,2021:35,2022:36,2023:37,2024:39,2025:41},
    "ECL":  {2020:40,2021:41,2022:42,2023:43,2024:44,2025:46},
}

def _log_activity(db: Session, user: str, action: str, page: str = "", item: str = "", details: str = ""):
    db.add(ActivityHistory(user=user, action=action, page=page, item=item, details=details, status="Completed"))
    db.commit()

# ──────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "MineSight API is running"}

@app.post("/auth/login")
def login(data: dict, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.username == data.get("username"), User.password == data.get("password")).first()
    if not u:
        raise HTTPException(401, "Invalid username or password")
    _log_activity(db, u.full_name, "Logged In", "Login")
    return {"id": u.id, "username": u.username, "role": u.role, "full_name": u.full_name, "token": f"mock-{u.id}"}

@app.post("/auth/logout")
def logout():
    return {"status": "ok"}

# ──────────────────────────────────────────────
# DASHBOARD
# ──────────────────────────────────────────────
@app.get("/dashboard")
def dashboard(year: Optional[int] = None, subsidiary: Optional[str] = None, db: Session = Depends(get_db)):
    dq = db.query(Document)
    if year: dq = dq.filter(Document.year == year)
    if subsidiary: dq = dq.filter(Document.subsidiary == subsidiary)

    total = dq.count()
    processed = dq.filter(Document.status == "Processed").count()
    info = db.query(ExtractedInformation)
    if subsidiary: info = info.filter(ExtractedInformation.subsidiary == subsidiary)
    if year: info = info.filter(ExtractedInformation.year == year)

    diffq = db.query(Difference)
    if subsidiary: diffq = diffq.filter(Difference.subsidiary == subsidiary)
    if year: diffq = diffq.filter(Difference.year == year)

    reports = db.query(Report)
    if subsidiary: reports = reports.filter(Report.subsidiary == subsidiary)
    if year: reports = reports.filter(Report.year == year)

    ai_count = db.query(AIQuestion).count()

    # Production chart data
    production_trend = []
    for yr in [2020,2021,2022,2023,2024,2025]:
        row = {"year": yr}
        for sub in ["MCL","WCL","NCL","SECL","CCL","BCCL","ECL"]:
            if subsidiary and sub != subsidiary:
                continue
            row[sub] = PRODUCTION.get(sub, {}).get(yr, 0)
        production_trend.append(row)

    target_vs_actual = []
    sel_year = year or 2024
    for sub in ["MCL","WCL","NCL","SECL","CCL","BCCL","ECL"]:
        if subsidiary and sub != subsidiary:
            continue
        target_vs_actual.append({
            "name": sub,
            "target": TARGETS.get(sub, {}).get(sel_year, 0),
            "actual": PRODUCTION.get(sub, {}).get(sel_year, 0)
        })

    recent_activity = []
    for a in db.query(ActivityHistory).order_by(desc(ActivityHistory.timestamp)).limit(10).all():
        recent_activity.append({"user": a.user, "action": a.action, "details": a.details,
                                "timestamp": a.timestamp.isoformat() if a.timestamp else ""})

    return {
        "total_documents": total,
        "processed_documents": processed,
        "documents_waiting": total - processed,
        "information_found": info.count(),
        "differences_found": diffq.count(),
        "differences_resolved": diffq.filter(Difference.status == "Resolved").count(),
        "reports_created": reports.count(),
        "ai_questions": ai_count,
        "production_trend": production_trend,
        "target_vs_actual": target_vs_actual,
        "recent_activity": recent_activity,
    }

# ──────────────────────────────────────────────
# DOCUMENTS
# ──────────────────────────────────────────────
@app.get("/documents")
def list_documents(year: Optional[int] = None, subsidiary: Optional[str] = None,
                   doc_type: Optional[str] = None, q: Optional[str] = None,
                   db: Session = Depends(get_db)):
    query = db.query(Document).order_by(desc(Document.upload_date))
    if year: query = query.filter(Document.year == year)
    if subsidiary: query = query.filter(Document.subsidiary == subsidiary)
    if doc_type: query = query.filter(Document.doc_type == doc_type)
    if q: query = query.filter(Document.name.contains(q))
    docs = query.all()
    return [{"id":d.id,"doc_id":d.doc_id,"name":d.name,"doc_type":d.doc_type,"year":d.year,
             "subsidiary":d.subsidiary,"mine":d.mine,"department":d.department,
             "upload_date":d.upload_date.isoformat() if d.upload_date else "",
             "uploaded_by":d.uploaded_by,"status":d.status,"reading_accuracy":d.reading_accuracy,
             "pages":d.pages,"file_type":d.file_type} for d in docs]

@app.get("/documents/{doc_id}")
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc: raise HTTPException(404, "Document not found")
    info = db.query(ExtractedInformation).filter(ExtractedInformation.document_id == doc.id).all()
    texts = db.query(DocumentText).filter(DocumentText.document_id == doc.id).all()
    checks = db.query(DataCheck).filter(DataCheck.document_id == doc.id).all()
    return {
        "document": {"id":doc.id,"doc_id":doc.doc_id,"name":doc.name,"doc_type":doc.doc_type,
                     "year":doc.year,"subsidiary":doc.subsidiary,"mine":doc.mine,
                     "department":doc.department,"uploaded_by":doc.uploaded_by,
                     "upload_date":doc.upload_date.isoformat() if doc.upload_date else "",
                     "status":doc.status,"reading_accuracy":doc.reading_accuracy,"pages":doc.pages},
        "extracted_information": [{"id":i.id,"field":i.field,"value":i.value,"unit":i.unit,
                                   "source_page":i.source_page,"status":i.status} for i in info],
        "document_text": [{"page":t.page_number,"text":t.text_content} for t in texts],
        "data_checks": [{"id":c.id,"check_type":c.check_type,"status":c.status,"message":c.message} for c in checks],
    }

@app.post("/documents/upload")
def upload_document(db: Session = Depends(get_db)):
    """Simulate document upload and processing."""
    import random
    doc_count = db.query(Document).count()
    doc_id = f"DOC-{2000 + doc_count}"
    sub = random.choice(["MCL","WCL","NCL","SECL","CCL","BCCL","ECL"])
    yr = 2024
    doc = Document(
        doc_id=doc_id, name=f"Uploaded Report {doc_count + 1}",
        doc_type="Annual Mining Report", year=yr, subsidiary=sub,
        mine="Bharatpur OCP", department="Mining", uploaded_by="R.K. Sharma",
        status="Processed", reading_accuracy=round(random.uniform(93, 99), 1),
        pages=random.randint(10, 60), file_type="PDF"
    )
    db.add(doc)
    db.flush()

    prod = PRODUCTION.get(sub, {}).get(yr, 100)
    target = TARGETS.get(sub, {}).get(yr, 95)
    for field, val, unit in [
        ("Coal Production", str(prod), "MT"),
        ("Production Target", str(target), "MT"),
        ("Coal Dispatch", str(round(prod * 0.95, 1)), "MT"),
    ]:
        db.add(ExtractedInformation(
            document_id=doc.id, field=field, value=val, numeric_value=float(val),
            unit=unit, source_page="Page 1", status="Correct",
            year=yr, subsidiary=sub, mine=doc.mine
        ))

    db.add(DocumentText(document_id=doc.id, page_number=1,
                        text_content=f"Coal production for {sub} in {yr} was {prod} MT against target of {target} MT."))

    _log_activity(db, "R.K. Sharma", "Uploaded Document", "Documents", doc_id, doc.name)
    db.commit()
    return {"id": doc.id, "doc_id": doc_id, "name": doc.name, "status": "Processed",
            "fields_extracted": 3, "differences_found": 0}

@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc: raise HTTPException(404, "Document not found")
    db.query(ExtractedInformation).filter(ExtractedInformation.document_id == doc_id).delete()
    db.query(DocumentText).filter(DocumentText.document_id == doc_id).delete()
    db.query(DataCheck).filter(DataCheck.document_id == doc_id).delete()
    db.delete(doc)
    _log_activity(db, "System", "Deleted Document", "Documents", doc.doc_id, doc.name)
    db.commit()
    return {"status": "deleted"}

@app.put("/documents/{doc_id}/submit")
def submit_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc: raise HTTPException(404, "Document not found")
    doc.status = "Submitted to Project Manager"
    _log_activity(db, "Supervisor", "Submitted Document", "Documents", doc.doc_id, doc.name)
    db.commit()
    return {"status": doc.status}

@app.get("/supervisor/stats")
def get_supervisor_stats(db: Session = Depends(get_db)):
    total = db.query(Document).count()
    pending = db.query(Document).filter(Document.status == "Processed").count()
    approved = db.query(Document).filter(Document.status == "Approved").count()
    return {
        "total_documents": total,
        "pending_submissions": pending,
        "approved_reports": approved,
        "queries_received": 2
    }

@app.get("/queries/supervisor")
def get_supervisor_queries():
    return [
        {
            "id": 1,
            "query": "Production value for April 2024 requires verification.",
            "source": "Project Manager",
            "document": "MCL Production Report 2024",
            "date": "21 Sep 2026",
            "status": "Pending"
        },
        {
            "id": 2,
            "query": "Missing geological mapping data on page 4.",
            "source": "Administrator",
            "document": "Geological Survey Report",
            "date": "20 Sep 2026",
            "status": "Pending"
        }
    ]

@app.post("/queries/{query_id}/respond")
def respond_query(query_id: int):
    return {"status": "Response Submitted"}

@app.put("/documents/{doc_id}/validate")
def validate_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc: raise HTTPException(404, "Document not found")
    doc.status = "Validated"
    _log_activity(db, "Project Manager", "Validated Document", "Data Validation", doc.doc_id, doc.name)
    db.commit()
    return {"status": doc.status}

@app.put("/reports/{report_id}/submit")
def submit_report(report_id: int, data: dict = {}, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    if r.status == "Submitted to Administrator":
        raise HTTPException(400, "Report already submitted to Administrator")
    submitted_by = data.get("submitted_by", "Project Manager")
    r.status = "Submitted to Administrator"
    r.submitted_by = submitted_by
    r.submitted_at = datetime.utcnow()
    _log_activity(db, submitted_by, "Submitted Report to Admin", "Reports", r.report_id, r.title)
    # Create a notification for the submission
    db.add(Notification(
        user="Administrator",
        message=f"Report '{r.title}' submitted by {submitted_by} for review.",
        type="info",
        link="/"
    ))
    db.commit()
    return {
        "status": r.status,
        "submitted_by": r.submitted_by,
        "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None
    }

@app.get("/pm/stats")
def get_pm_stats(db: Session = Depends(get_db)):
    pending = db.query(Document).filter(Document.status == "Submitted to Project Manager").count()
    validating = db.query(Document).filter(Document.status == "Under Validation").count()
    reports = db.query(Report).count()
    submitted_admin = db.query(Report).filter(Report.status == "Submitted to Administrator").count()
    return {
        "pending_reviews": pending,
        "under_validation": validating,
        "reports_generated": reports,
        "submitted_to_admin": submitted_admin,
        "open_queries": 3
    }

@app.get("/queries/pm")
def get_pm_queries(db: Session = Depends(get_db)):
    queries = db.query(AdminQuery).filter(AdminQuery.status == "Open").all()
    return [{
        "id": q.id,
        "query": q.query,
        "action_requested": q.action_requested,
        "source": q.source,
        "document": q.document_name,
        "date": q.date.strftime("%d %b %Y"),
        "status": q.status
    } for q in queries]

@app.post("/queries/pm/{query_id}/resolve")
def resolve_pm_query(query_id: int, db: Session = Depends(get_db)):
    q = db.query(AdminQuery).filter(AdminQuery.id == query_id).first()
    if q:
        q.status = "Resolved"
        
        # We should also mark the related report as 'Resubmitted' (we assume PM resubmits it implicitly or explicitly later)
        # For simplicity, if we know the report, we can update it here. But usually PM clicks resubmit explicitly.
        
        db.commit()
    return {"status": "Resolved / Resubmitted"}

# ──────────────────────────────────────────────
# ADMIN WORKFLOW
# ──────────────────────────────────────────────

@app.get("/admin/reports")
def get_admin_reports(db: Session = Depends(get_db)):
    # Fetch reports awaiting review (Submitted to Administrator or Resubmitted)
    reports = db.query(Report).filter(Report.status.in_(["Submitted to Administrator", "Resubmitted", "Under Administrator Review"])).all()
    return [{
        "id": r.id,
        "report_id": r.report_id,
        "title": r.title,
        "report_type": r.report_type,
        "year": r.year,
        "subsidiary": r.subsidiary,
        "mine": r.mine,
        "created_by": r.created_by,
        "created_at": r.created_at.isoformat() if r.created_at else "",
        "status": r.status,
        "source_count": r.source_count,
        "submitted_by": r.submitted_by or "Project Manager",
        "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None
    } for r in reports]

@app.put("/reports/{report_id}/approve")
def approve_report(report_id: int, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    r.status = "Approved"
    _log_activity(db, "Administrator", "Approved Final Report", "Reports", r.report_id, r.title)
    db.commit()
    return {"status": r.status}

@app.post("/reports/{report_id}/query")
def raise_admin_query(report_id: int, data: dict, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    
    r.status = "Query Raised"
    
    q = AdminQuery(
        report_id=r.id,
        query=data.get("query", ""),
        action_requested=data.get("action_requested", ""),
        document_name=r.title
    )
    db.add(q)
    _log_activity(db, "Administrator", "Raised Query on Report", "Reports", r.report_id, data.get("query", ""))
    db.commit()
    return {"status": r.status}

# ──────────────────────────────────────────────
# CHECK DATA
# ──────────────────────────────────────────────
@app.get("/check-data")
def check_data(subsidiary: Optional[str] = None, year: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(ExtractedInformation)
    if subsidiary: q = q.filter(ExtractedInformation.subsidiary == subsidiary)
    if year: q = q.filter(ExtractedInformation.year == year)
    infos = q.all()
    checks = db.query(DataCheck).all()
    check_map = {}
    for c in checks:
        check_map.setdefault(c.document_id, []).append({"type": c.check_type, "status": c.status, "message": c.message})
    return [{"id":i.id,"document_id":i.document_id,"field":i.field,"value":i.value,"unit":i.unit,
             "source_page":i.source_page,"status":i.status,"year":i.year,"subsidiary":i.subsidiary,
             "mine":i.mine,"checks":check_map.get(i.document_id, [])} for i in infos]

# ──────────────────────────────────────────────
# DIFFERENCES
# ──────────────────────────────────────────────
@app.get("/differences")
def list_differences(status: Optional[str] = None, subsidiary: Optional[str] = None,
                     year: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Difference).order_by(desc(Difference.id))
    if status: q = q.filter(Difference.status == status)
    if subsidiary: q = q.filter(Difference.subsidiary == subsidiary)
    if year: q = q.filter(Difference.year == year)
    diffs = q.all()
    return [{"id":d.id,"diff_id":d.diff_id,"field":d.field,"value_a":d.value_a,"value_b":d.value_b,
             "unit_a":d.unit_a,"unit_b":d.unit_b,
             "doc_a_id":d.doc_a_id,"doc_b_id":d.doc_b_id,
             "doc_a_name":d.doc_a_name,"doc_b_name":d.doc_b_name,
             "page_a":d.page_a,"page_b":d.page_b,
             "year":d.year,"subsidiary":d.subsidiary,"priority":d.priority,"status":d.status,
             "resolution":d.resolution,"resolved_by":d.resolved_by} for d in diffs]

@app.get("/differences/{diff_id}")
def get_difference(diff_id: int, db: Session = Depends(get_db)):
    d = db.query(Difference).filter(Difference.id == diff_id).first()
    if not d: raise HTTPException(404, "Difference not found")
    return {"id":d.id,"diff_id":d.diff_id,"field":d.field,"value_a":d.value_a,"value_b":d.value_b,
            "unit_a":d.unit_a,"unit_b":d.unit_b,"doc_a_id":d.doc_a_id,"doc_b_id":d.doc_b_id,
            "doc_a_name":d.doc_a_name,"doc_b_name":d.doc_b_name,
            "page_a":d.page_a,"page_b":d.page_b,"year":d.year,"subsidiary":d.subsidiary,
            "priority":d.priority,"status":d.status,"resolution":d.resolution}

@app.post("/differences/{diff_id}/resolve")
def resolve_difference(diff_id: int, data: dict, db: Session = Depends(get_db)):
    d = db.query(Difference).filter(Difference.id == diff_id).first()
    if not d: raise HTTPException(404, "Difference not found")
    d.status = "Resolved"
    d.resolution = data.get("resolution", "Manually resolved")
    d.reason = data.get("reason", "")
    d.resolved_by = data.get("resolved_by", "R.K. Sharma")
    d.resolved_at = datetime.utcnow()
    _log_activity(db, d.resolved_by, "Resolved Difference", "Differences", d.diff_id,
                  f"{d.field}: {d.value_a} {d.unit_a} vs {d.value_b} {d.unit_b} - {d.resolution}")
    db.commit()
    return {"status": "resolved", "diff_id": d.diff_id}

# ──────────────────────────────────────────────
# SEARCH
# ──────────────────────────────────────────────
@app.get("/search")
def search(q: str, year: Optional[int] = None, subsidiary: Optional[str] = None, db: Session = Depends(get_db)):
    terms = q.lower().split()
    # Search documents
    doc_q = db.query(Document)
    for t in terms:
        doc_q = doc_q.filter(or_(
            func.lower(Document.name).contains(t),
            func.lower(Document.subsidiary).contains(t),
            func.lower(Document.mine).contains(t),
            func.lower(Document.doc_type).contains(t)
        ))
    if year: doc_q = doc_q.filter(Document.year == year)
    if subsidiary: doc_q = doc_q.filter(Document.subsidiary == subsidiary)
    docs = doc_q.limit(20).all()

    # Search extracted info
    info_q = db.query(ExtractedInformation)
    for t in terms:
        info_q = info_q.filter(or_(
            func.lower(ExtractedInformation.field).contains(t),
            func.lower(ExtractedInformation.value).contains(t),
            func.lower(ExtractedInformation.subsidiary).contains(t)
        ))
    infos = info_q.limit(20).all()

    # Search topics
    topic_q = db.query(Topic)
    for t in terms:
        topic_q = topic_q.filter(or_(
            func.lower(Topic.name).contains(t),
            func.lower(Topic.keywords).contains(t)
        ))
    topics = topic_q.limit(10).all()

    _log_activity(db, "User", "Searched Documents", "Smart Search", "", f"Query: {q}")
    db.commit()

    return {
        "documents": [{"id":d.id,"doc_id":d.doc_id,"name":d.name,"doc_type":d.doc_type,
                       "year":d.year,"subsidiary":d.subsidiary,"mine":d.mine} for d in docs],
        "information": [{"id":i.id,"field":i.field,"value":i.value,"unit":i.unit,
                         "source_page":i.source_page,"subsidiary":i.subsidiary,
                         "year":i.year} for i in infos],
        "topics": [{"id":t.id,"name":t.name,"document_count":t.document_count,
                    "mention_count":t.mention_count} for t in topics],
    }

# ──────────────────────────────────────────────
# AI
# ──────────────────────────────────────────────
@app.post("/ai/query")
def ai_query(data: dict, db: Session = Depends(get_db)):
    question = data.get("question", "")
    q_lower = question.lower()

    # Smart mock AI: search the database for relevant info
    answer = ""
    sources = []

    # Check for specific patterns
    sub_match = None
    year_match = None
    for sub in ["mcl","wcl","ncl","secl","ccl","bccl","ecl"]:
        if sub in q_lower:
            sub_match = sub.upper()
            break
    for yr in [2020,2021,2022,2023,2024,2025]:
        if str(yr) in q_lower:
            year_match = yr
            break

    if "production" in q_lower and sub_match:
        yr = year_match or 2024
        prod = PRODUCTION.get(sub_match, {}).get(yr, 0)
        target = TARGETS.get(sub_match, {}).get(yr, 0)
        achievement = round(prod / target * 100, 1) if target > 0 else 0
        answer = (f"{sub_match} coal production for {yr} was {prod} MT against a target of "
                  f"{target} MT, achieving {achievement}% of the target.")
        # Find source documents
        docs = db.query(Document).filter(Document.subsidiary == sub_match, Document.year == yr).limit(3).all()
        sources = [{"document": d.name, "page": f"Page {d.pages // 3 or 1}", "doc_id": d.doc_id} for d in docs]

    elif "compare" in q_lower and ("production" in q_lower or "mcl" in q_lower):
        yr = year_match or 2024
        lines = []
        for sub in ["MCL","WCL","NCL","SECL","CCL","BCCL","ECL"]:
            p = PRODUCTION.get(sub, {}).get(yr, 0)
            lines.append(f"{sub}: {p} MT")
        answer = f"Coal production comparison for {yr}:\n" + "\n".join(lines)
        docs = db.query(Document).filter(Document.year == yr).limit(3).all()
        sources = [{"document": d.name, "page": "Page 1", "doc_id": d.doc_id} for d in docs]

    elif "topic" in q_lower or "subject" in q_lower:
        topics = db.query(Topic).order_by(desc(Topic.mention_count)).limit(5).all()
        lines = [f"- {t.name} ({t.mention_count} mentions across {t.document_count} documents)" for t in topics]
        answer = "The main topics found across mining reports are:\n" + "\n".join(lines)

    elif "difference" in q_lower:
        total = db.query(Difference).count()
        unresolved = db.query(Difference).filter(Difference.status == "Needs Review").count()
        answer = f"The system found {total} differences across documents. {unresolved} are still pending review."

    elif "summarize" in q_lower or "summary" in q_lower:
        yr = year_match or 2024
        total = sum(PRODUCTION.get(s, {}).get(yr, 0) for s in PRODUCTION)
        answer = (f"Summary for {yr}: Total coal production across all CIL subsidiaries was approximately "
                  f"{total} MT. MCL led production at {PRODUCTION['MCL'].get(yr, 0)} MT followed by "
                  f"SECL at {PRODUCTION['SECL'].get(yr, 0)} MT.")
        docs = db.query(Document).filter(Document.year == yr).limit(3).all()
        sources = [{"document": d.name, "page": "Page 1", "doc_id": d.doc_id} for d in docs]

    elif "dispatch" in q_lower and sub_match:
        yr = year_match or 2024
        prod = PRODUCTION.get(sub_match, {}).get(yr, 0)
        dispatch = round(prod * 0.95, 1)
        answer = f"Coal dispatch for {sub_match} in {yr} was approximately {dispatch} MT."
        docs = db.query(Document).filter(Document.subsidiary == sub_match, Document.year == yr).limit(2).all()
        sources = [{"document": d.name, "page": "Page 1", "doc_id": d.doc_id} for d in docs]

    elif "safety" in q_lower:
        answer = "Safety is a top priority across all CIL subsidiaries. Reports indicate continuous improvement in safety measures with regular training programs and incident monitoring."
        sources = [{"document": "Safety Report 2024", "page": "Page 5"}]

    else:
        # Generic: search extracted information
        infos = db.query(ExtractedInformation).limit(5).all()
        if infos:
            lines = [f"- {i.field}: {i.value} {i.unit} ({i.subsidiary}, {i.year})" for i in infos]
            answer = "Here is some relevant information from the documents:\n" + "\n".join(lines)
        else:
            answer = "I could not find enough information in the uploaded documents to answer this question."

    # Save to history
    db.add(AIQuestion(question=question, answer=answer, sources=json.dumps(sources),
                      asked_by=data.get("user", "User")))
    _log_activity(db, data.get("user", "User"), "Asked AI Question", "Ask AI", "", question)
    db.commit()

    return {"answer": answer, "sources": sources}

@app.get("/ai/history")
def ai_history(db: Session = Depends(get_db)):
    questions = db.query(AIQuestion).order_by(desc(AIQuestion.asked_at)).limit(50).all()
    return [{"id":q.id,"question":q.question,"answer":q.answer,
             "sources":json.loads(q.sources) if q.sources else [],
             "asked_by":q.asked_by,
             "asked_at":q.asked_at.isoformat() if q.asked_at else ""} for q in questions]

# ──────────────────────────────────────────────
# TOPICS
# ──────────────────────────────────────────────
@app.get("/topics")
def list_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(desc(Topic.mention_count)).all()
    return [{"id":t.id,"name":t.name,"document_count":t.document_count,
             "mention_count":t.mention_count,
             "keywords":t.keywords.split(",") if t.keywords else [],
             "related_subsidiaries":t.related_subsidiaries.split(",") if t.related_subsidiaries else []} for t in topics]

@app.get("/topics/{topic_id}")
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    t = db.query(Topic).filter(Topic.id == topic_id).first()
    if not t: raise HTTPException(404, "Topic not found")
    return {"id":t.id,"name":t.name,"document_count":t.document_count,
            "mention_count":t.mention_count,
            "keywords":t.keywords.split(",") if t.keywords else [],
            "related_subsidiaries":t.related_subsidiaries.split(",") if t.related_subsidiaries else []}

# ──────────────────────────────────────────────
# WORD CLOUD
# ──────────────────────────────────────────────
@app.get("/wordcloud")
def wordcloud(subsidiary: Optional[str] = None, year: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(DocumentText)
    if subsidiary or year:
        doc_ids = db.query(Document.id)
        if subsidiary: doc_ids = doc_ids.filter(Document.subsidiary == subsidiary)
        if year: doc_ids = doc_ids.filter(Document.year == year)
        q = q.filter(DocumentText.document_id.in_(doc_ids.subquery()))

    texts = q.all()
    word_freq = {}
    stop = {"the","a","an","in","of","for","and","to","was","is","at","by","with","from","on","as","that","this","it","are","be"}
    for t in texts:
        for word in t.text_content.lower().split():
            word = word.strip(".,;:()[]{}\"'")
            if len(word) > 2 and word not in stop and not word.isdigit():
                word_freq[word] = word_freq.get(word, 0) + 1

    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:80]
    return [{"word": w, "count": c} for w, c in sorted_words]

# ──────────────────────────────────────────────
# REPORTS
# ──────────────────────────────────────────────
@app.get("/reports")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(desc(Report.created_at)).all()
    return [{"id":r.id,"report_id":r.report_id,"title":r.title,"report_type":r.report_type,
             "year":r.year,"subsidiary":r.subsidiary,"mine":r.mine,
             "created_by":r.created_by,
             "created_at":r.created_at.isoformat() if r.created_at else "",
             "status":r.status,"source_count":r.source_count} for r in reports]

@app.post("/reports/generate")
def generate_report(data: dict, db: Session = Depends(get_db)):
    report_type = data.get("report_type", "Production Report")
    year = data.get("year", 2024)
    subsidiary = data.get("subsidiary", "MCL")
    mine = data.get("mine")

    report_count = db.query(Report).count()
    report_id = f"RPT-{report_count + 100}"

    prod = PRODUCTION.get(subsidiary, {}).get(year, 0)
    target = TARGETS.get(subsidiary, {}).get(year, 0)
    achievement = round(prod / target * 100, 1) if target > 0 else 0
    dispatch = round(prod * 0.95, 1)

    content = json.dumps({
        "title": f"{report_type} - {subsidiary} ({year})",
        "executive_summary": f"This report presents the {report_type.lower()} for {subsidiary} during FY {year}. Total coal production was {prod} MT against a target of {target} MT, achieving {achievement}% of the target.",
        "production": {"actual": prod, "target": target, "achievement": achievement, "dispatch": dispatch},
        "sections": [
            {"title": "Overview", "content": f"{subsidiary} operations during {year} showed consistent performance."},
            {"title": "Production Details", "content": f"Coal production: {prod} MT\nTarget: {target} MT\nAchievement: {achievement}%\nDispatch: {dispatch} MT"},
            {"title": "Target vs Actual", "content": f"The subsidiary achieved {achievement}% of its production target."},
            {"title": "Important Findings", "content": "All major production targets were met. Safety standards maintained."},
            {"title": "Trends", "content": "Production has shown a steady upward trend over the past 5 years."},
        ],
        "sources": [
            {"document": f"Annual Mining Report {year} - {subsidiary}", "doc_id": f"DOC-{1001 + report_count}"},
            {"document": f"Production Report {year} - {subsidiary}", "doc_id": f"DOC-{1002 + report_count}"},
        ]
    })

    src_count = db.query(Document).filter(Document.subsidiary == subsidiary, Document.year == year).count()
    report = Report(
        report_id=report_id, title=f"{report_type} - {subsidiary} ({year})",
        report_type=report_type, year=year, subsidiary=subsidiary, mine=mine,
        created_by=data.get("created_by", "R.K. Sharma"), status="Generated",
        content=content, source_count=src_count
    )
    db.add(report)
    _log_activity(db, data.get("created_by", "R.K. Sharma"), "Generated Report", "Reports", report_id, report.title)
    db.commit()
    return {"id": report.id, "report_id": report_id, "title": report.title, "status": "Generated"}

@app.get("/reports/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    content = json.loads(r.content) if r.content else {}
    return {"id":r.id,"report_id":r.report_id,"title":r.title,"report_type":r.report_type,
            "year":r.year,"subsidiary":r.subsidiary,"mine":r.mine,
            "created_by":r.created_by,"created_at":r.created_at.isoformat() if r.created_at else "",
            "status":r.status,"source_count":r.source_count,"content":content,
            "submitted_by": r.submitted_by,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None}

@app.get("/reports/{report_id}/export/{fmt}")
def export_report(report_id: int, fmt: str, db: Session = Depends(get_db)):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    content = json.loads(r.content) if r.content else {}

    _log_activity(db, "User", "Downloaded Report", "Reports", r.report_id, f"{fmt.upper()} format")
    db.commit()

    if fmt == "json":
        return StreamingResponse(
            io.BytesIO(json.dumps(content, indent=2).encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={r.report_id}.json"}
        )
    elif fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Section", "Content"])
        writer.writerow(["Title", content.get("title", "")])
        writer.writerow(["Executive Summary", content.get("executive_summary", "")])
        prod = content.get("production", {})
        writer.writerow(["Production (MT)", prod.get("actual", "")])
        writer.writerow(["Target (MT)", prod.get("target", "")])
        writer.writerow(["Achievement (%)", prod.get("achievement", "")])
        for section in content.get("sections", []):
            writer.writerow([section.get("title", ""), section.get("content", "")])
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={r.report_id}.csv"}
        )
    elif fmt == "pdf":
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        story.append(Paragraph(content.get("title", r.title), styles["Title"]))
        story.append(Spacer(1, 12))
        story.append(Paragraph("Executive Summary", styles["Heading2"]))
        story.append(Paragraph(content.get("executive_summary", ""), styles["Normal"]))
        story.append(Spacer(1, 12))
        prod = content.get("production", {})
        story.append(Paragraph(f"Production: {prod.get('actual','')} MT | Target: {prod.get('target','')} MT | Achievement: {prod.get('achievement','')}%", styles["Normal"]))
        story.append(Spacer(1, 12))
        for section in content.get("sections", []):
            story.append(Paragraph(section.get("title", ""), styles["Heading2"]))
            story.append(Paragraph(section.get("content", "").replace("\n", "<br/>"), styles["Normal"]))
            story.append(Spacer(1, 8))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"Report ID: {r.report_id} | Generated: {r.created_at}", styles["Normal"]))
        doc.build(story)
        buf.seek(0)
        return StreamingResponse(buf, media_type="application/pdf",
                                 headers={"Content-Disposition": f"attachment; filename={r.report_id}.pdf"})
    elif fmt == "docx":
        from docx import Document as DocxDoc
        from docx.shared import Inches
        doc = DocxDoc()
        doc.add_heading(content.get("title", r.title), 0)
        doc.add_heading("Executive Summary", level=1)
        doc.add_paragraph(content.get("executive_summary", ""))
        prod = content.get("production", {})
        doc.add_paragraph(f"Production: {prod.get('actual','')} MT | Target: {prod.get('target','')} MT | Achievement: {prod.get('achievement','')}%")
        for section in content.get("sections", []):
            doc.add_heading(section.get("title", ""), level=1)
            doc.add_paragraph(section.get("content", ""))
        doc.add_paragraph(f"\nReport ID: {r.report_id} | Generated: {r.created_at}")
        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)
        return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                 headers={"Content-Disposition": f"attachment; filename={r.report_id}.docx"})
    else:
        raise HTTPException(400, "Unsupported format. Use: pdf, docx, csv, json")

# ──────────────────────────────────────────────
# ANALYTICS
# ──────────────────────────────────────────────
@app.get("/analytics")
def analytics(year: Optional[int] = None, subsidiary: Optional[str] = None, db: Session = Depends(get_db)):
    production_trend = []
    for yr in [2020,2021,2022,2023,2024,2025]:
        row = {"year": yr}
        total = 0
        for sub in PRODUCTION:
            if subsidiary and sub != subsidiary:
                continue
            val = PRODUCTION[sub].get(yr, 0)
            row[sub] = val
            total += val
        row["total"] = total
        production_trend.append(row)

    target_vs_actual = []
    for sub in PRODUCTION:
        if subsidiary and sub != subsidiary:
            continue
        sel_yr = year or 2024
        target_vs_actual.append({
            "name": sub,
            "target": TARGETS.get(sub, {}).get(sel_yr, 0),
            "actual": PRODUCTION.get(sub, {}).get(sel_yr, 0)
        })

    # Document processing stats
    doc_stats = []
    for yr in [2020,2021,2022,2023,2024,2025]:
        q = db.query(Document).filter(Document.year == yr)
        if subsidiary: q = q.filter(Document.subsidiary == subsidiary)
        doc_stats.append({"year": yr, "count": q.count()})

    diff_stats = []
    for yr in [2020,2021,2022,2023,2024,2025]:
        q = db.query(Difference).filter(Difference.year == yr)
        if subsidiary: q = q.filter(Difference.subsidiary == subsidiary)
        total = q.count()
        resolved = q.filter(Difference.status == "Resolved").count()
        diff_stats.append({"year": yr, "total": total, "resolved": resolved})

    return {
        "production_trend": production_trend,
        "target_vs_actual": target_vs_actual,
        "document_stats": doc_stats,
        "difference_stats": diff_stats
    }

# ──────────────────────────────────────────────
# ACTIVITY HISTORY
# ──────────────────────────────────────────────
@app.get("/activity")
def activity_history(db: Session = Depends(get_db)):
    acts = db.query(ActivityHistory).order_by(desc(ActivityHistory.timestamp)).limit(200).all()
    return [{"id":a.id,"timestamp":a.timestamp.isoformat() if a.timestamp else "",
             "user":a.user,"action":a.action,"page":a.page,"item":a.item,
             "status":a.status,"details":a.details} for a in acts]

# ──────────────────────────────────────────────
# USERS
# ──────────────────────────────────────────────
@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id":u.id,"username":u.username,"role":u.role,"full_name":u.full_name,
             "status":u.status,"last_active":u.last_active.isoformat() if u.last_active else ""} for u in users]

@app.post("/users")
def create_user(data: dict, db: Session = Depends(get_db)):
    u = User(username=data["username"], password=data.get("password", "pass123"),
             role=data.get("role", "Viewer"), full_name=data.get("full_name", data["username"]))
    db.add(u)
    _log_activity(db, "Admin", "Created User", "Users", data["username"])
    db.commit()
    return {"id": u.id, "username": u.username}

@app.put("/users/{user_id}")
def update_user(user_id: int, data: dict, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    if "role" in data: u.role = data["role"]
    if "full_name" in data: u.full_name = data["full_name"]
    if "status" in data: u.status = data["status"]
    db.commit()
    return {"status": "updated"}

# ──────────────────────────────────────────────
# NOTIFICATIONS
# ──────────────────────────────────────────────
@app.get("/notifications")
def list_notifications(db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(desc(Notification.created_at)).limit(20).all()
    return [{"id":n.id,"message":n.message,"type":n.type,"read":n.read,"link":n.link,
             "created_at":n.created_at.isoformat() if n.created_at else ""} for n in notifs]

@app.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.read = True
        db.commit()
    return {"status": "ok"}

# ──────────────────────────────────────────────
# SETTINGS
# ──────────────────────────────────────────────
@app.get("/settings")
def get_settings():
    return {
        "general": {"app_name": "MineSight", "version": "1.0.0"},
        "ai": {"provider": "Mock AI", "model": "Built-in mock responses"},
        "document_processing": {"ocr_provider": "Mock Reader", "supported_formats": "PDF, DOCX, XLSX, CSV, JPG, PNG"},
        "search": {"provider": "Smart Mock Search", "mode": "Keyword matching"},
        "database": {"mode": "SQLite", "path": "data/minesight.db"},
        "export": {"formats": ["PDF", "DOCX", "CSV", "JSON"]},
    }

@app.put("/settings")
def update_settings(data: dict):
    return {"status": "Settings saved"}

# ──────────────────────────────────────────────
# SUBSIDIARIES & MINES (master data)
# ──────────────────────────────────────────────
@app.get("/subsidiaries")
def list_subsidiaries(db: Session = Depends(get_db)):
    subs = db.query(Subsidiary).all()
    return [{"id": s.id, "name": s.name, "full_name": s.full_name} for s in subs]

@app.get("/mines")
def list_mines(subsidiary: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Mine)
    if subsidiary: q = q.filter(Mine.subsidiary_name == subsidiary)
    mines = q.all()
    return [{"id": m.id, "name": m.name, "subsidiary": m.subsidiary_name} for m in mines]
