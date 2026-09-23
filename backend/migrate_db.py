import sqlite3

def migrate(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # admin_queries: response, resolved_by, resolved_at, ai_draft_answer
    admin_cols = ['response', 'resolved_by', 'resolved_at', 'ai_draft_answer']
    for col in admin_cols:
        try:
            cur.execute(f"ALTER TABLE admin_queries ADD COLUMN {col} TEXT;")
            print(f"Added {col} to admin_queries")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col} already exists in admin_queries")
            else:
                raise
                
    # supervisor_queries: raised_by, raised_by_role, ai_draft_answer
    sup_cols = ['raised_by', 'raised_by_role', 'ai_draft_answer']
    for col in sup_cols:
        try:
            cur.execute(f"ALTER TABLE supervisor_queries ADD COLUMN {col} TEXT;")
            print(f"Added {col} to supervisor_queries")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col} already exists in supervisor_queries")
            else:
                raise
                
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate('data/minesight.db')
