"""
Surgical fix for backend/app/main.py:
- Removes all corrupted content between the known-good section endings
- Restores the clean ai_history, list_topics, get_topic, and new enhanced wordcloud endpoint
"""

import sys

path = "backend/app/main.py"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# ──────────────────────────────────────────────────────────────────────────────
# Find the clean anchor before the corruption: the end of ai_history was broken.
# The safest approach: find the ai_history def line, cut everything from there
# to the start of _build_report_pdf (which we know is clean).
# ──────────────────────────────────────────────────────────────────────────────

BUILD_PDF_MARKER = "\ndef _build_report_pdf(r: Report, content: dict) -> bytes:"

# Find the location of the clean _build_report_pdf
idx_build = content.find(BUILD_PDF_MARKER)
if idx_build == -1:
    print("ERROR: Could not find _build_report_pdf marker!", file=sys.stderr)
    sys.exit(1)

# Find the start of @app.get("/ai/history")
AI_HISTORY_MARKER = '\n@app.get("/ai/history")'
idx_ai = content.find(AI_HISTORY_MARKER)
if idx_ai == -1:
    print("ERROR: Could not find /ai/history marker!", file=sys.stderr)
    sys.exit(1)

# Everything before /ai/history  (unchanged)
before = content[:idx_ai]

# Everything after _build_report_pdf  (unchanged)
after = content[idx_build:]

# Clean replacement block
replacement = '''
@app.get("/ai/history")
def ai_history(db: Session = Depends(get_db)):
    questions = db.query(AIQuestion).order_by(desc(AIQuestion.asked_at)).limit(50).all()
    return [{"id":q.id,"question":q.question,"answer":q.answer,
             "sources":json.loads(q.sources) if q.sources else [],
             "asked_by":q.asked_by,
             "asked_at":q.asked_at.isoformat() if q.asked_at else ""} for q in questions]

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
# WORD CLOUD — Enhanced with domain-aware filtering
# ──────────────────────────────────────────────
@app.get("/wordcloud")
def wordcloud(
    subsidiary: Optional[str] = None,
    year: Optional[int] = None,
    top_n: int = 80,
    dataset_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    import re as _re
    q = db.query(DocumentText)
    if subsidiary or year or dataset_type:
        doc_ids = db.query(Document.id)
        if subsidiary:
            doc_ids = doc_ids.filter(Document.subsidiary == subsidiary)
        if year:
            doc_ids = doc_ids.filter(Document.year == year)
        if dataset_type:
            doc_ids = doc_ids.filter(Document.doc_type.ilike(f"%{dataset_type}%"))
        q = q.filter(DocumentText.document_id.in_(doc_ids.subquery()))

    texts = q.all()

    # Comprehensive domain-aware stop list (4 layers)
    stop = {
        # Layer 1 – generic English function words
        "the","a","an","in","of","for","and","to","was","is","at","by","with",
        "from","on","as","that","this","it","are","be","or","all","any","not",
        "but","has","had","have","been","which","were","will","would","can",
        "could","should","about","into","than","then","also","its","per","each",
        "such","more","other","these","those","their","they","them","only","over",
        "after","before","during","between","under","above","out","our","your",
        "some","may","both","via","etc","same","through","said","since","when",
        "where","being","does","did","even","get","got","given","give","must",
        "let","well","still","what","who","how","one","two","three","four","five",
        # Layer 2 – metadata / provenance / ingestion boilerplate
        "official","source","url","http","https","www","page","pages","pdf",
        "html","href","csv","xlsx","docx","doc","record","records","listing",
        "dataset","datasets","verified","verification","sha256","checksum",
        "provenance","ingestion","ingested","downloaded","download","uploads",
        "uploaded","uploading","filename","format","template","schema","null",
        "none","true","false","direct","dated","stated","archived",
        "publication","publications","published","publishing","unpublished",
        "towards","cleaner","tomorrow","friendly","initiatives","initiative",
        "premier","quarterly","edition","special","naccer","techvista",
        "minetech","sop","cmsms","khanan","prahari","surveillance","mobile",
        "inviting","bbsr","expl","bbl","tndr",
        # Layer 3 – DB/UI navigation noise
        "document","documents","content","text","item","items","status","view",
        "click","number","category","portal","platform","table","column",
        "index","report","reports","information","details","reference",
        "title","description","name","type","department","size","bytes",
        "com","gov","nic","org","net","annual","data","based",
        # Layer 4 – tender-listing structural tokens
        "cmpdi","tenders","tender","region","value","opening","closing","camp",
        "office","block","colony","period","years","year","rate","notice",
        "works","work","complex","state","dated","notification",
        "bilaspur","bhubaneswar","asansol","singrauli","ranchi","nagpur",
        "dhanbad","district","coalfield","hiring","building","repair","repairing",
        "pump","testing","commissioning","administration",
        # Organisation / source abbreviations (they appear as meta not content)
        "mcl","wcl","ncl","secl","ccl","bccl","ecl","cil","ntpc","sail","ongc",
    }

    word_freq: dict = {}
    for t in texts:
        for word in _re.findall(r"[a-zA-Z]{4,}", t.text_content.lower()):
            if word not in stop:
                word_freq[word] = word_freq.get(word, 0) + 1

    cap = min(int(top_n) if top_n else 80, 150)
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:cap]
    total_unique = len(word_freq)
    max_c = sorted_words[0][1] if sorted_words else 1
    min_c = sorted_words[-1][1] if sorted_words else 1

    return {
        "words": [{"word": w, "count": c} for w, c in sorted_words],
        "total_unique": total_unique,
        "top_n": cap,
        "max_count": max_c,
        "min_count": min_c,
        "filters_applied": {
            "subsidiary": subsidiary,
            "year": year,
            "dataset_type": dataset_type,
        }
    }

'''

new_content = before + replacement + after

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Fixed! Total lines: {new_content.count(chr(10))}")

# Quick compile check
import py_compile, tempfile, os
try:
    py_compile.compile(path, doraise=True)
    print("Syntax check: PASS")
except py_compile.PyCompileError as e:
    print(f"Syntax check: FAIL\n{e}")
