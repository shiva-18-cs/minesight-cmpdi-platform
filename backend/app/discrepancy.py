"""
MineSight - Discrepancy Detection Engine
Cross-references ExtractedInformation across documents to identify conflicting data points.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.domain import ExtractedInformation, Difference, Document

def detect_discrepancies(db: Session, doc_id: Optional[int] = None) -> List[Difference]:
    """
    Scans ExtractedInformation records and detects differences between documents
    sharing the same subsidiary, mine, year, and field.
    
    If doc_id is provided, checks differences between that document and all other existing documents.
    Otherwise checks all documents.
    """
    query = db.query(ExtractedInformation)
    if doc_id:
        target_info = query.filter(ExtractedInformation.document_id == doc_id).all()
        # Find candidates matching the same (subsidiary, year, field)
        new_diffs = []
        for info_a in target_info:
            candidates = db.query(ExtractedInformation).filter(
                ExtractedInformation.document_id != doc_id,
                ExtractedInformation.subsidiary == info_a.subsidiary,
                ExtractedInformation.year == info_a.year,
                ExtractedInformation.field == info_a.field
            ).all()
            
            for info_b in candidates:
                # Compare mine if both present
                if info_a.mine and info_b.mine and info_a.mine != info_b.mine:
                    continue
                
                diff = _compare_and_create_diff(db, info_a, info_b)
                if diff:
                    new_diffs.append(diff)
        return new_diffs
    else:
        # Full scan
        all_info = query.all()
        # Group by (subsidiary, year, field)
        grouped = {}
        for item in all_info:
            key = (item.subsidiary, item.year, item.field)
            grouped.setdefault(key, []).append(item)
            
        new_diffs = []
        for (sub, yr, field), items in grouped.items():
            if len(items) < 2:
                continue
            for i in range(len(items)):
                for j in range(i + 1, len(items)):
                    info_a, info_b = items[i], items[j]
                    if info_a.document_id == info_b.document_id:
                        continue
                    if info_a.mine and info_b.mine and info_a.mine != info_b.mine:
                        continue
                    diff = _compare_and_create_diff(db, info_a, info_b)
                    if diff:
                        new_diffs.append(diff)
        return new_diffs

def _compare_and_create_diff(db: Session, a: ExtractedInformation, b: ExtractedInformation) -> Optional[Difference]:
    # Check if a difference already exists between these two docs for this field
    existing = db.query(Difference).filter(
        Difference.field == a.field,
        ((Difference.doc_a_id == a.document_id) & (Difference.doc_b_id == b.document_id)) |
        ((Difference.doc_a_id == b.document_id) & (Difference.doc_b_id == a.document_id))
    ).first()
    
    if existing:
        return None
    
    val_a = a.normalized_value if a.normalized_value is not None else a.numeric_value
    val_b = b.normalized_value if b.normalized_value is not None else b.numeric_value
    
    is_diff = False
    pct_diff = 0.0
    
    if val_a is not None and val_b is not None:
        if abs(val_a - val_b) > 0.01:
            is_diff = True
            base = max(abs(val_a), abs(val_b), 1.0)
            pct_diff = abs(val_a - val_b) / base * 100
    else:
        # String comparison
        if str(a.value).strip().lower() != str(b.value).strip().lower():
            is_diff = True
            pct_diff = 100.0

    if not is_diff:
        return None

    # Priority determination based on magnitude
    if pct_diff > 20.0:
        priority = "High"
    elif pct_diff > 5.0:
        priority = "Medium"
    else:
        priority = "Low"

    doc_a = db.query(Document).filter(Document.id == a.document_id).first()
    doc_b = db.query(Document).filter(Document.id == b.document_id).first()
    
    diff_count = db.query(Difference).count() + 1
    diff_id = f"D-{diff_count:03d}"
    
    diff = Difference(
        diff_id=diff_id,
        field=a.field,
        value_a=str(a.value),
        value_b=str(b.value),
        unit_a=a.unit or a.normalized_unit or "",
        unit_b=b.unit or b.normalized_unit or "",
        doc_a_id=a.document_id,
        doc_b_id=b.document_id,
        doc_a_name=doc_a.name if doc_a else f"DOC-{a.document_id}",
        doc_b_name=doc_b.name if doc_b else f"DOC-{b.document_id}",
        page_a=a.source_page or "Unknown",
        page_b=b.source_page or "Unknown",
        year=a.year or (doc_a.year if doc_a else None),
        subsidiary=a.subsidiary or (doc_a.subsidiary if doc_a else None),
        mine=a.mine or (doc_a.mine if doc_a else None),
        priority=priority,
        status="Needs Review",
        reason=f"Numerical mismatch of {pct_diff:.1f}% detected between reports." if pct_diff > 0 else "Content discrepancy detected."
    )
    db.add(diff)
    db.flush()
    return diff
