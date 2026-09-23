"""
MineSight - Database Schema Refresh & Data Cleanup Script
Purges all synthetic/seeded demo data, recreates tables with latest columns,
and preserves/initializes master reference data (Users, Subsidiaries, Mines).
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import engine, Base, SessionLocal
from app.models.domain import (
    User, Subsidiary, Mine, Document, DocumentText, ExtractedInformation,
    DataCheck, Difference, Topic, Report, AIQuestion, Notification, ActivityHistory,
    AdminQuery, SupervisorQuery, DataSource
)

STANDARD_SUBSIDIARIES = [
    ("MCL", "Mahanadi Coalfields Limited"),
    ("WCL", "Western Coalfields Limited"),
    ("NCL", "Northern Coalfields Limited"),
    ("SECL", "South Eastern Coalfields Limited"),
    ("CCL", "Central Coalfields Limited"),
    ("BCCL", "Bharat Coking Coal Limited"),
    ("ECL", "Eastern Coalfields Limited"),
]

STANDARD_MINES = {
    "MCL": ["Bharatpur OCP", "Lakhanpur OCP", "Belpahar OCP", "Bhubaneswari OCP"],
    "WCL": ["Umrer OCP", "Penganga OCP", "Gondegaon OCP"],
    "NCL": ["Nigahi OCP", "Jayant OCP", "Dudhichua OCP"],
    "SECL": ["Gevra OCP", "Kusmunda OCP", "Dipka OCP"],
    "CCL": ["Ashoka OCP", "Piprawar OCP"],
    "BCCL": ["Kusunda OCP", "Block II OCP"],
    "ECL": ["Rajmahal OCP", "Sonepur Bazari OCP"],
}

STANDARD_USERS = [
    ("admin", "admin123", "Administrator", "Chief Mining Engineer"),
    ("projectmanager", "manager123", "Project Manager", "A.K. Verma"),
    ("supervisor", "supervisor123", "Supervisor", "R.K. Sharma"),
]

def clean_database():
    db = SessionLocal()
    saved_users = []
    saved_subs = []
    saved_mines = []
    
    try:
        # Save master data if available
        for u in db.query(User).all():
            saved_users.append((u.username, u.password, u.role, u.full_name))
        for s in db.query(Subsidiary).all():
            saved_subs.append((s.name, s.full_name))
        for m in db.query(Mine).all():
            saved_mines.append((m.name, m.subsidiary_name))
    except Exception:
        pass
    finally:
        db.close()

    print("Recreating database schema with latest model definitions...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Schema created successfully.")

    db = SessionLocal()
    try:
        # Populate Users
        users_to_add = saved_users if saved_users else STANDARD_USERS
        for uname, pwd, role, fname in users_to_add:
            db.add(User(username=uname, password=pwd, role=role, full_name=fname))
        db.commit()

        # Populate Subsidiaries
        subs_to_add = saved_subs if saved_subs else STANDARD_SUBSIDIARIES
        sub_map = {}
        for sname, sfname in subs_to_add:
            sub_obj = Subsidiary(name=sname, full_name=sfname)
            db.add(sub_obj)
            db.flush()
            sub_map[sname] = sub_obj.id
        db.commit()

        # Populate Mines
        if saved_mines:
            for mname, msname in saved_mines:
                db.add(Mine(name=mname, subsidiary_id=sub_map.get(msname), subsidiary_name=msname))
        else:
            for sname, mlist in STANDARD_MINES.items():
                sid = sub_map.get(sname)
                for mname in mlist:
                    db.add(Mine(name=mname, subsidiary_id=sid, subsidiary_name=sname))
        db.commit()

        # Log system initialization in ActivityHistory
        db.add(ActivityHistory(
            user="System",
            action="Database Cleaned & Migrated",
            page="System",
            item="Real Data Architecture",
            status="Completed",
            details="Synthetic records purged. Master reference data preserved."
        ))
        db.commit()

        print("\nPreserved Master Data counts:")
        user_count = db.query(User).count()
        sub_count = db.query(Subsidiary).count()
        mine_count = db.query(Mine).count()
        print(f"  Users: {user_count}")
        print(f"  Subsidiaries: {sub_count}")
        print(f"  Mines: {mine_count}")
        print("\nDatabase is now completely clean and ready for real data ingestion.")
    except Exception as e:
        db.rollback()
        print(f"Error initializing master data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()
