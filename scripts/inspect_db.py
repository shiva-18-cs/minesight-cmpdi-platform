import sqlite3
import re
from collections import Counter

conn = sqlite3.connect('data/minesight.db')
cursor = conn.cursor()

# List tables
tables = [t[0] for t in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)

# Check extracted_information table
if 'extracted_informations' in tables:
    rows = cursor.execute("SELECT * FROM extracted_informations LIMIT 2").fetchall()
    cols = [d[0] for d in cursor.description]
    print("\nextracted_informations columns:", cols)
    print("Sample rows:", rows[:1])

# Check documents for distinct subsidiaries and years
subs = [r[0] for r in cursor.execute("SELECT DISTINCT subsidiary FROM documents WHERE subsidiary IS NOT NULL").fetchall()]
years = [r[0] for r in cursor.execute("SELECT DISTINCT year FROM documents WHERE year IS NOT NULL ORDER BY year DESC LIMIT 10").fetchall()]
print("\nDistinct subsidiaries:", subs[:10])
print("Distinct years:", years[:10])

# Look for any text/content fields
for t in tables:
    cols_info = cursor.execute(f"PRAGMA table_info({t})").fetchall()
    text_cols = [c[1] for c in cols_info if 'text' in c[1].lower() or 'content' in c[1].lower() or 'summary' in c[1].lower()]
    if text_cols:
        print(f"\nTable '{t}' has text columns: {text_cols}")
        sample = cursor.execute(f"SELECT {text_cols[0]} FROM {t} LIMIT 1").fetchone()
        if sample:
            print(f"  Sample ({text_cols[0]}): {str(sample[0])[:200]}")

# Count documents
total = cursor.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
print(f"\nTotal documents: {total}")

conn.close()
