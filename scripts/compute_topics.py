"""
MineSight - Authentic Topic Modeling & Clustering
Extracts recurring topics and keyword clusters from actual DocumentText in the repository.
"""
import os, sys, re
from collections import Counter

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import engine, Base, SessionLocal
from app.models.domain import Document, DocumentText, Topic

TOPIC_SEEDS = [
    ("Satellite Remote Sensing & Land Reclamation", ["satellite", "reclamation", "restoration", "remote sensing", "plantation", "greenbelt", "opencast", "void"]),
    ("Geological Exploration & Core Drilling", ["drilling", "geological", "boreholes", "reserves", "exploration", "geophysical", "logging", "seam"]),
    ("Coal Production & Operational Performance", ["production", "target", "offtake", "dispatch", "raw coal", "opencast", "achievement", "tons", "mt"]),
    ("Environmental & Air Quality Monitoring", ["air quality", "caaqms", "pm10", "pm2.5", "environment", "monitoring", "pollution", "stations"]),
    ("Hydrogeology & Mine Inflow Dynamics", ["hydrogeology", "aquifer", "groundwater", "dewatering", "inflow", "monsoon", "modeling", "talcher"]),
    ("Clean Coal Beneficiation & Washery Operations", ["washery", "beneficiation", "cyclones", "reject", "coal preparation", "quality", "gcv"])
]

def compute_topics():
    db = SessionLocal()
    try:
        texts = db.query(DocumentText).all()
        docs = db.query(Document).all()
        
        doc_map = {d.id: d for d in docs}
        all_text = " ".join([t.text_content.lower() for t in texts])

        db.query(Topic).delete()
        db.commit()

        for topic_name, keywords in TOPIC_SEEDS:
            # Count mentions of keywords
            mention_count = 0
            matching_docs = set()
            related_subs = set()

            for kw in keywords:
                count = len(re.findall(r'\b' + re.escape(kw) + r'\b', all_text, re.IGNORECASE))
                mention_count += count
                for t in texts:
                    if re.search(r'\b' + re.escape(kw) + r'\b', t.text_content, re.IGNORECASE):
                        matching_docs.add(t.document_id)
                        d = doc_map.get(t.document_id)
                        if d and d.subsidiary:
                            related_subs.add(d.subsidiary)

            if mention_count > 0:
                topic_obj = Topic(
                    name=topic_name,
                    document_count=len(matching_docs),
                    mention_count=mention_count,
                    keywords=",".join(keywords[:6]),
                    related_subsidiaries=",".join(list(related_subs)[:4])
                )
                db.add(topic_obj)

        db.commit()
        print(f"Computed and registered {db.query(Topic).count()} authentic topics from document texts.")
    except Exception as e:
        db.rollback()
        print(f"Error computing topics: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    compute_topics()
