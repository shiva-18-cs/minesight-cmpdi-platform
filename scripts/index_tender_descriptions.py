"""
MineSight - Dataset 2: Index Official Tender Metadata & Descriptions into DocumentText evidence layer.
Strictly adheres to official CMPDI source data without synthetic text or artificial summaries.
"""
import os
import sys
import re
from bs4 import BeautifulSoup

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
CACHE_FILE = os.path.join(DATA_DIR, 'sources', 'cmpdi_archived_tenders_raw.html')

sys.path.insert(0, BACKEND_DIR)
sys.stdout.reconfigure(encoding='utf-8')

from app.database import SessionLocal
from app.models.domain import Document, DocumentText

def main():
    print("=== INDEXING DATASET 2 ARCHIVED TENDER METADATA INTO DOCUMENTTEXT ===")
    
    if not os.path.exists(CACHE_FILE):
        raise FileNotFoundError(f"Raw CMPDI cache file not found at {CACHE_FILE}")

    with open(CACHE_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    table = soup.find('table')
    if not table:
        raise ValueError("Could not find table in CMPDI HTML cache.")

    rows = table.find_all('tr')[1:]
    total_rows = len(rows)
    print(f"Loaded {total_rows} raw rows from official CMPDI cache.")

    db = SessionLocal()
    try:
        all_tdr_docs = db.query(Document).filter(
            Document.doc_type.like('%Archived Tender%')
        ).order_by(Document.id).all()

        print(f"Found {len(all_tdr_docs)} tender documents in DB.")
        if len(all_tdr_docs) != total_rows:
            print(f"WARNING: DB count ({len(all_tdr_docs)}) differs from raw row count ({total_rows}).")

        # Delete existing tender DocumentText records to prevent duplicates
        deleted_count = db.query(DocumentText).filter(
            DocumentText.document_id.in_([d.id for d in all_tdr_docs])
        ).delete(synchronize_session=False)
        db.commit()
        print(f"Cleared {deleted_count} old tender DocumentText records.")

        created_count = 0
        for idx, (r, doc) in enumerate(zip(rows, all_tdr_docs)):
            cells = r.find_all(['td', 'th'])
            sl_no = cells[0].get_text(strip=True) if len(cells) > 0 else ""
            t_no = cells[1].get_text(strip=True) if len(cells) > 1 else doc.document_number
            desc = cells[2].get_text(strip=True) if len(cells) > 2 else doc.name
            t_type = cells[3].get_text(strip=True) if len(cells) > 3 else "Tender"
            pub_dt = cells[4].get_text(strip=True) if len(cells) > 4 else "Not Stated"
            close_dt = cells[5].get_text(strip=True) if len(cells) > 5 else "Not Stated"
            open_dt = cells[6].get_text(strip=True) if len(cells) > 6 else "Not Stated"
            val_str = cells[7].get_text(strip=True) if len(cells) > 7 else ""

            val_text = f"{val_str} INR" if val_str else "Not Stated"
            pdf_url_text = doc.source_url if doc.source_url else "N/A (Listing-only record)"
            badge = "Official CMPDI Archived Tender Document" if doc.is_official_raw_download else "Official CMPDI Archived Tender Listing"
            dept_str = doc.department if doc.department else "Operations & Tenders"
            mine_str = doc.mine if doc.mine else "CMPDI HQ"

            text_content = (
                f"{badge}: {t_no}\n"
                f"Official Title/Description: {desc}\n"
                f"Tender Type: {t_type}\n"
                f"Tender Value: {val_text}\n"
                f"Publication Date: {pub_dt}\n"
                f"Closing Date: {close_dt}\n"
                f"Opening Date: {open_dt}\n"
                f"Department: {dept_str}\n"
                f"Region: {mine_str}\n"
                f"Official Source Page: {doc.source_page}\n"
                f"Direct Official PDF URL: {pdf_url_text}"
            )

            dt = DocumentText(
                document_id=doc.id,
                page_number=1,
                text_content=text_content
            )
            db.add(dt)
            created_count += 1

            if created_count % 500 == 0:
                db.commit()
                print(f"Indexed {created_count}/{total_rows} tender records into DocumentText...")

        db.commit()
        print(f"\nSUCCESS: Successfully indexed {created_count} tender descriptions into DocumentText!")

        total_dt = db.query(DocumentText).count()
        print(f"Total DocumentText records in DB: {total_dt} (7 Dataset 1 + {created_count} Dataset 2)")

    except Exception as e:
        db.rollback()
        print(f"Error during indexing: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    main()
