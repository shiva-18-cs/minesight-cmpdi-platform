import urllib.request, ssl, json, os, sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

url = 'https://www.cmpdi.co.in/en/tenders/archived-tenders'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
    html = r.read().decode('utf-8', errors='ignore')

print('Total HTML length:', len(html))

soup = BeautifulSoup(html, 'html.parser')

print('Page Title:', soup.title.string if soup.title else 'No title')

tables = soup.find_all('table')
print('Tables found:', len(tables))

print()
print('--- All Links (safely encoded) ---')
links = soup.find_all('a', href=True)
for l in links:
    txt = l.get_text(strip=True).encode('ascii', 'replace').decode('ascii')
    href = l['href'].encode('ascii', 'replace').decode('ascii')
    if len(txt) > 4:
        print('  [' + txt[:80] + '] -> ' + href[:120])

print()
print('--- Script Tags with tender/data keywords ---')
for s in soup.find_all('script'):
    content = s.string or ''
    if any(kw in content.lower() for kw in ['tender', 'archive', 'nit', 'bid', 'supplyorder', 'drupal']):
        safe = content[:800].encode('ascii', 'replace').decode('ascii')
        print('Script content:', safe)
        print()

print()
print('--- iframes ---')
for iframe in soup.find_all('iframe'):
    print('iframe src:', iframe.get('src',''))

print()
print('--- All divs with IDs containing tender ---')
for div in soup.find_all(['div','section'], id=True):
    div_id = div.get('id','').lower()
    if any(kw in div_id for kw in ['tender', 'content', 'main', 'view']):
        txt = div.get_text(separator=' ', strip=True)[:400].encode('ascii','replace').decode('ascii')
        print('Div#' + div.get('id','') + ':', txt)
        print()

print()
print('--- Drupal settings / views data ---')
for s in soup.find_all('script'):
    content = s.string or ''
    if 'drupalSettings' in content or 'views' in content.lower():
        safe = content[:1200].encode('ascii','replace').decode('ascii')
        print('Drupal script:', safe[:1000])
        print()
        break
