"""
Parse the CMPDI tenders iframe page and extract all tender records.
Identify archived/closed tenders and check for document download links.
"""
import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

from bs4 import BeautifulSoup
from datetime import datetime

with open('data/cmpdi_tenders_iframe.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

table = soup.find('table')
rows = table.find_all('tr')
print(f'Total rows: {len(rows)}')

# Parse header
header_row = rows[0]
headers = [th.get_text(strip=True) for th in header_row.find_all(['th','td'])]
print('Columns:', headers)
print()

today = datetime(2026, 9, 23)

all_records = []
for row in rows[1:]:
    cells = row.find_all(['td','th'])
    if len(cells) < 6:
        continue
    
    data = [c.get_text(strip=True) for c in cells]
    
    # Extract any links in cells
    links_in_row = []
    for c in cells:
        for a in c.find_all('a', href=True):
            href = a['href']
            txt = a.get_text(strip=True)
            links_in_row.append({'text': txt, 'href': href})
    
    record = {
        'sl_no': data[0] if len(data) > 0 else '',
        'tender_no': data[1] if len(data) > 1 else '',
        'description': data[2] if len(data) > 2 else '',
        'tender_type': data[3] if len(data) > 3 else '',
        'sale_open_date': data[4] if len(data) > 4 else '',
        'closing_date': data[5] if len(data) > 5 else '',
        'opening_date': data[6] if len(data) > 6 else '',
        'tender_value': data[7] if len(data) > 7 else '',
        'document_link_text': data[8] if len(data) > 8 else '',
        'links': links_in_row
    }
    
    all_records.append(record)

print(f'Parsed {len(all_records)} records')

# Try to parse closing dates and identify archived (closed) tenders
def parse_date(date_str):
    if not date_str:
        return None
    for fmt in ['%d-%b-%y', '%d.%m.%Y', '%d/%m/%Y', '%d-%m-%Y', '%d-%b-%Y']:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except:
            pass
    return None

archived = []
current = []
unparsed = []

for r in all_records:
    closing = parse_date(r['closing_date'])
    if closing is None:
        unparsed.append(r)
    elif closing < today:
        archived.append(r)
    else:
        current.append(r)

print(f'Archived (closed) tenders: {len(archived)}')
print(f'Current/Active tenders: {len(current)}')
print(f'Unparsed dates: {len(unparsed)}')

# Sample archived records
print()
print('=== SAMPLE ARCHIVED RECORDS (first 20) ===')
for r in archived[:20]:
    print(f'  [{r["tender_no"]}] {r["description"][:70]} | Close: {r["closing_date"]} | Val: {r["tender_value"]}')
    if r['links']:
        for l in r['links']:
            print(f'    LINK: [{l["text"]}] -> {l["href"][:100]}')

# Check for PDF links
print()
print('=== RECORDS WITH DOCUMENT LINKS ===')
with_links = [r for r in archived if r.get('links')]
print(f'Archived records with links: {len(with_links)}')
for r in with_links[:10]:
    print(f'  [{r["tender_no"]}]: ', r['links'][:3])

# Save full parsed dataset
with open('data/cmpdi_tenders_parsed.json', 'w', encoding='utf-8') as f:
    json.dump({
        'total': len(all_records),
        'archived': len(archived),
        'current': len(current),
        'archived_records': archived
    }, f, ensure_ascii=False, indent=2)
print()
print('Saved parsed data to data/cmpdi_tenders_parsed.json')
