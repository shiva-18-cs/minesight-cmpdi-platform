import sqlite3
import re
from collections import Counter

conn = sqlite3.connect('data/minesight.db')
cursor = conn.cursor()

# Check document_text table
rows = cursor.execute("SELECT text_content FROM document_text LIMIT 5").fetchall()
print("Sample document_text rows:")
for r in rows:
    print(" ", repr(r[0][:200]))

# Extended stop words for domain-specific noise
stop = {
    # Generic English
    'the','a','an','in','of','for','and','to','was','is','at','by','with',
    'from','on','as','that','this','it','are','be','or','all','any','not',
    'but','has','had','have','been','which','were','will','would','can',
    'could','should','about','into','than','then','also','its','per','each',
    'such','more','other','these','those','their','they','them','only','over',
    'after','before','during','between','under','above','out','up','down',
    'same','etc','via','both','through','some','may','our','your','my',
    # Metadata/provenance terms
    'official','date','url','source','page','record','records','listing',
    'pdf','http','https','www','gov','dataset','datasets','verified',
    'table','row','column','index','document','documents','sha256','status',
    'view','click','doc','com','nic','org','net','size','kb','mb','bytes',
    'null','none','true','false','filename','format','category','portal',
    'platform','content','text','item','items','number','sr','sl','no',
    'title','description','name','type','department','download','file',
    'href','html','csv','xlsx','docx','cmpdi_dataset','direct','n/a',
    'tender','official','towards','remote','sensing','cleaner','tomorrow',
    'publication','data','report','reports','information','details',
    'reference','ref','based','using','used','made','make','provides',
    'provided','available','related','relevant',
}

rows_all = cursor.execute("SELECT text_content FROM document_text").fetchall()
word_freq = Counter()
for (text,) in rows_all:
    for word in re.findall(r'[a-zA-Z]{4,}', text.lower()):
        if word not in stop:
            word_freq[word] += 1

print("\nTop 60 domain keywords:")
for w, c in word_freq.most_common(60):
    print(f"  {w}: {c}")

conn.close()
