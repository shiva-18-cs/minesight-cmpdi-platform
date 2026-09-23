import shutil, datetime, os, sys

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'minesight.db')
ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', f'minesight_backup_{ts}.db')

if os.path.exists(src):
    shutil.copy2(src, dst)
    print(f"Backup created: {dst}")
else:
    print("No existing database found -- skipping backup.")
