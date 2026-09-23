"""
=============================================================================
WARNING: DEMO / PROTOTYPE SYNTHETIC DATA GENERATOR ONLY
DO NOT RUN IN PRODUCTION OR REAL DATA ENVIRONMENTS.
This script populates the database with artificial/mock data.
For real data environments, use scripts/ingest_real_data.py or the UI upload.
=============================================================================
"""

import os, sys, json, random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import engine, Base, SessionLocal
from app.models.domain import (
    User, Subsidiary, Mine, Document, DocumentText, ExtractedInformation,
    DataCheck, Difference, Topic, Report, AIQuestion, Notification, ActivityHistory
)

random.seed(42)

SUBSIDIARIES = [
    ("MCL", "Mahanadi Coalfields Limited"),
    ("WCL", "Western Coalfields Limited"),
    ("NCL", "Northern Coalfields Limited"),
    ("SECL", "South Eastern Coalfields Limited"),
    ("CCL", "Central Coalfields Limited"),
    ("BCCL", "Bharat Coking Coal Limited"),
    ("ECL", "Eastern Coalfields Limited"),
]

MINES_PER_SUB = {
    "MCL": ["Bharatpur OCP", "Lakhanpur OCP", "Ananta OCP"],
    "WCL": ["Niljai OCP", "Sasti OCP", "Wani OCP"],
    "NCL": ["Jayant OCP", "Dudhichua OCP"],
    "SECL": ["Gevra OCP", "Kusmunda OCP", "Dipka OCP"],
    "CCL": ["Ashoka OCP", "Piparwar OCP"],
    "BCCL": ["Govindpur OCP", "Block-II OCP"],
    "ECL": ["Rajmahal OCP", "Sonepur Bazari OCP"],
}

YEARS = [2020, 2021, 2022, 2023, 2024, 2025]
DOC_TYPES = [
    "Annual Mining Report", "Production Report", "Geological Report",
    "Safety Report", "Equipment Report", "Environmental Report",
    "Subsidiary Performance Report", "Historical Report",
    "Administrative Report", "Parliamentary Response"
]

# Production data - consistent across the app
PRODUCTION_DATA = {
    "MCL":  {2020: 148.0, 2021: 157.0, 2022: 168.0, 2023: 176.0, 2024: 182.0, 2025: 190.0},
    "WCL":  {2020: 46.0,  2021: 48.0,  2022: 51.0,  2023: 52.0,  2024: 55.0,  2025: 57.0},
    "NCL":  {2020: 108.0, 2021: 112.0, 2022: 118.0, 2023: 120.0, 2024: 124.0, 2025: 128.0},
    "SECL": {2020: 140.0, 2021: 145.0, 2022: 150.0, 2023: 155.0, 2024: 160.0, 2025: 165.0},
    "CCL":  {2020: 70.0,  2021: 72.0,  2022: 75.0,  2023: 78.0,  2024: 80.0,  2025: 82.0},
    "BCCL": {2020: 32.0,  2021: 33.0,  2022: 35.0,  2023: 36.0,  2024: 38.0,  2025: 40.0},
    "ECL":  {2020: 38.0,  2021: 39.0,  2022: 40.0,  2023: 41.0,  2024: 43.0,  2025: 45.0},
}

TARGET_DATA = {
    "MCL":  {2020: 145.0, 2021: 155.0, 2022: 165.0, 2023: 175.0, 2024: 180.0, 2025: 188.0},
    "WCL":  {2020: 48.0,  2021: 50.0,  2022: 52.0,  2023: 54.0,  2024: 56.0,  2025: 58.0},
    "NCL":  {2020: 110.0, 2021: 115.0, 2022: 120.0, 2023: 122.0, 2024: 126.0, 2025: 130.0},
    "SECL": {2020: 138.0, 2021: 142.0, 2022: 148.0, 2023: 153.0, 2024: 158.0, 2025: 163.0},
    "CCL":  {2020: 72.0,  2021: 74.0,  2022: 76.0,  2023: 80.0,  2024: 82.0,  2025: 84.0},
    "BCCL": {2020: 34.0,  2021: 35.0,  2022: 36.0,  2023: 37.0,  2024: 39.0,  2025: 41.0},
    "ECL":  {2020: 40.0,  2021: 41.0,  2022: 42.0,  2023: 43.0,  2024: 44.0,  2025: 46.0},
}

FIELDS = [
    "Coal Production", "Production Target", "Coal Dispatch", "Coal Offtake",
    "Overburden Removal", "Manpower", "Equipment Availability",
    "Geological Reserve", "Revenue", "Operating Cost", "Safety Incidents"
]

def seed():
    print("=" * 60)
    print("  MineSight - Database Seeding")
    print("=" * 60)

    # Ensure data directory
    os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'data'), exist_ok=True)

    print("\n[1/12] Creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ---- USERS ----
    print("[2/12] Seeding users...")
    users = [
        User(username="admin", password="admin123", role="Administrator", full_name="System Administrator"),
        User(username="projectmanager", password="manager123", role="Project Manager", full_name="Project Manager"),
        User(username="supervisor", password="supervisor123", role="Supervisor", full_name="Mine Supervisor")
    ]
    db.add_all(users)
    db.flush()

    # ---- SUBSIDIARIES & MINES ----
    print("[3/12] Seeding subsidiaries & mines...")
    for short, full in SUBSIDIARIES:
        sub = Subsidiary(name=short, full_name=full)
        db.add(sub)
        db.flush()
        for mine_name in MINES_PER_SUB[short]:
            db.add(Mine(name=mine_name, subsidiary_id=sub.id, subsidiary_name=short))

    # ---- DOCUMENTS ----
    print("[4/12] Seeding documents (50+)...")
    doc_counter = 1000
    all_docs = []
    uploaders = ["R.K. Sharma", "P. Verma", "A. Singh", "System"]
    departments = ["Mining", "Geology", "Safety", "Planning", "Environment", "Finance"]

    for sub_short, _ in SUBSIDIARIES:
        mines = MINES_PER_SUB[sub_short]
        for year in YEARS:
            # Annual report per subsidiary per year
            doc_counter += 1
            d = Document(
                doc_id=f"DOC-{doc_counter}",
                name=f"Annual Mining Report {year} - {sub_short}",
                doc_type="Annual Mining Report", year=year, subsidiary=sub_short,
                mine=random.choice(mines),
                department="Mining",
                uploaded_by=random.choice(uploaders),
                upload_date=datetime(year, 3, random.randint(1, 28)),
                status="Processed",
                reading_accuracy=round(random.uniform(93, 99), 1),
                pages=random.randint(30, 120),
                file_type="PDF"
            )
            db.add(d)
            db.flush()
            all_docs.append(d)

            # Production report
            if random.random() > 0.3:
                doc_counter += 1
                d2 = Document(
                    doc_id=f"DOC-{doc_counter}",
                    name=f"Production Report {year} - {sub_short}",
                    doc_type="Production Report", year=year, subsidiary=sub_short,
                    mine=random.choice(mines),
                    department="Mining",
                    uploaded_by=random.choice(uploaders),
                    upload_date=datetime(year, 6, random.randint(1, 28)),
                    status="Processed",
                    reading_accuracy=round(random.uniform(93, 99), 1),
                    pages=random.randint(10, 40),
                    file_type="PDF"
                )
                db.add(d2)
                db.flush()
                all_docs.append(d2)

    # Extra docs to hit 50+
    extra_types = ["Geological Report", "Safety Report", "Equipment Report",
                   "Environmental Report", "Administrative Report", "Parliamentary Response"]
    for _ in range(15):
        doc_counter += 1
        sub = random.choice(SUBSIDIARIES)[0]
        yr = random.choice(YEARS)
        dt = random.choice(extra_types)
        d = Document(
            doc_id=f"DOC-{doc_counter}",
            name=f"{dt} {yr} - {sub}",
            doc_type=dt, year=yr, subsidiary=sub,
            mine=random.choice(MINES_PER_SUB[sub]),
            department=random.choice(departments),
            uploaded_by=random.choice(uploaders),
            upload_date=datetime(yr, random.randint(1, 12), random.randint(1, 28)),
            status="Processed",
            reading_accuracy=round(random.uniform(90, 99), 1),
            pages=random.randint(5, 60),
            file_type=random.choice(["PDF", "DOCX", "XLSX"])
        )
        db.add(d)
        db.flush()
        all_docs.append(d)

    print(f"    Created {len(all_docs)} documents")

    # ---- DOCUMENT TEXT ----
    print("[5/12] Seeding document text...")
    for doc in all_docs:
        prod = PRODUCTION_DATA.get(doc.subsidiary, {}).get(doc.year, 50.0)
        target = TARGET_DATA.get(doc.subsidiary, {}).get(doc.year, 48.0)
        text = (
            f"Annual coal production during FY {doc.year}-{str(doc.year+1)[-2:]} for {doc.subsidiary} "
            f"was {prod} million tonnes against a target of {target} million tonnes. "
            f"The achievement percentage was {round(prod/target*100, 1)}%. "
            f"Coal dispatch stood at {round(prod * 0.95, 1)} MT. "
            f"Overburden removal was {round(prod * 3.2, 1)} million cubic metres. "
            f"Safety incidents reported during the period: {random.randint(0, 8)}. "
            f"Total manpower deployed: {random.randint(5000, 25000)}."
        )
        db.add(DocumentText(document_id=doc.id, page_number=1, text_content=text))

    # ---- EXTRACTED INFORMATION ----
    print("[6/12] Seeding extracted information (200+)...")
    info_count = 0
    for doc in all_docs:
        prod = PRODUCTION_DATA.get(doc.subsidiary, {}).get(doc.year, 50.0)
        target = TARGET_DATA.get(doc.subsidiary, {}).get(doc.year, 48.0)
        dispatch = round(prod * 0.95, 1)
        obr = round(prod * 3.2, 1)
        revenue = round(prod * 45, 0)
        cost = round(prod * 32, 0)
        safety = random.randint(0, 8)
        manpower = random.randint(5000, 25000)
        page = f"Page {random.randint(1, max(doc.pages, 2))}"

        records = [
            ("Coal Production", str(prod), prod, "MT", page, "Correct"),
            ("Production Target", str(target), target, "MT", page, "Correct"),
            ("Coal Dispatch", str(dispatch), dispatch, "MT", page, "Correct"),
            ("Overburden Removal", str(obr), obr, "MCM", page, "Correct"),
        ]
        if random.random() > 0.3:
            records.append(("Revenue", str(revenue), revenue, "Cr", page, "Correct"))
        if random.random() > 0.5:
            records.append(("Operating Cost", str(cost), cost, "Cr", page, "Correct"))
        if random.random() > 0.4:
            records.append(("Safety Incidents", str(safety), float(safety), "Count", page, "Correct"))
        if random.random() > 0.5:
            records.append(("Manpower", str(manpower), float(manpower), "Persons", page, "Correct"))

        for field, val, num_val, unit, src, st in records:
            db.add(ExtractedInformation(
                document_id=doc.id, field=field, value=val,
                numeric_value=num_val, unit=unit, source_page=src, status=st,
                year=doc.year, subsidiary=doc.subsidiary, mine=doc.mine
            ))
            info_count += 1

    print(f"    Created {info_count} extracted information records")

    # ---- DATA CHECKS ----
    print("[7/12] Seeding data checks...")
    check_count = 0
    check_types = [
        ("Missing Value", "Check Needed", "Value is missing for this field"),
        ("Wrong Unit", "Check Needed", "Unit does not match expected format"),
        ("Duplicate Information", "Check Needed", "This information appears in another document"),
        ("Wrong Year", "Check Needed", "Document year does not match the reported period"),
        ("Value Mismatch", "Problem Found", "Value differs from another source"),
    ]
    # Add specific test case checks
    for doc in random.sample(all_docs, min(40, len(all_docs))):
        ct = random.choice(check_types)
        db.add(DataCheck(
            info_id=None, check_type=ct[0], status=ct[1], message=ct[2], document_id=doc.id
        ))
        check_count += 1

    # ---- DIFFERENCES ----
    print("[8/12] Seeding differences (50+)...")
    diff_count = 0

    # REQUIRED TEST CASE 1: Real difference 5.2 MT vs 5.8 MT
    db.add(Difference(
        diff_id="D-001", field="Coal Production",
        value_a="5.2", value_b="5.8", unit_a="MT", unit_b="MT",
        doc_a_id=all_docs[0].id, doc_b_id=all_docs[1].id if len(all_docs) > 1 else all_docs[0].id,
        doc_a_name=all_docs[0].name, doc_b_name=all_docs[1].name if len(all_docs) > 1 else all_docs[0].name,
        page_a="Page 27", page_b="Page 34",
        year=2024, subsidiary="MCL", priority="High", status="Needs Review"
    ))
    diff_count += 1

    # REQUIRED TEST CASE 2: Same value different units
    db.add(Difference(
        diff_id="D-002", field="Coal Production",
        value_a="5.2", value_b="5,200,000", unit_a="MT", unit_b="KG",
        doc_a_id=all_docs[0].id, doc_b_id=all_docs[2].id if len(all_docs) > 2 else all_docs[0].id,
        doc_a_name=all_docs[0].name, doc_b_name=all_docs[2].name if len(all_docs) > 2 else all_docs[0].name,
        page_a="Page 27", page_b="Row 2",
        year=2024, subsidiary="MCL", priority="Medium", status="Needs Review"
    ))
    diff_count += 1

    # REQUIRED TEST CASE 4: Wrong year
    db.add(Difference(
        diff_id="D-003", field="Report Year",
        value_a="2024", value_b="2023", unit_a="Year", unit_b="Year",
        doc_a_id=all_docs[0].id, doc_b_id=all_docs[0].id,
        doc_a_name="Report Header", doc_b_name="Document Details",
        page_a="Page 1", page_b="Properties",
        year=2024, subsidiary="MCL", priority="High", status="Needs Review"
    ))
    diff_count += 1

    # REQUIRED TEST CASE 5: Same mine name different subsidiary
    db.add(Difference(
        diff_id="D-004", field="Mine Assignment",
        value_a="MCL", value_b="WCL", unit_a="Subsidiary", unit_b="Subsidiary",
        doc_a_id=all_docs[0].id, doc_b_id=all_docs[3].id if len(all_docs) > 3 else all_docs[0].id,
        doc_a_name="Annual Mining Report 2024 - MCL", doc_b_name="Annual Mining Report 2024 - WCL",
        page_a="Page 5", page_b="Page 3",
        year=2024, subsidiary="MCL", priority="Medium", status="Needs Review"
    ))
    diff_count += 1

    # Generate more differences
    for i in range(5, 55):
        sub = random.choice(SUBSIDIARIES)[0]
        yr = random.choice(YEARS)
        field = random.choice(FIELDS[:6])
        base_val = round(random.uniform(10, 200), 1)
        diff_val = round(base_val + random.uniform(-5, 5), 1)
        d_a = random.choice(all_docs)
        d_b = random.choice(all_docs)
        db.add(Difference(
            diff_id=f"D-{i:03d}", field=field,
            value_a=str(base_val), value_b=str(diff_val),
            unit_a="MT", unit_b="MT",
            doc_a_id=d_a.id, doc_b_id=d_b.id,
            doc_a_name=d_a.name, doc_b_name=d_b.name,
            page_a=f"Page {random.randint(1,50)}", page_b=f"Page {random.randint(1,50)}",
            year=yr, subsidiary=sub,
            priority=random.choice(["High", "Medium", "Low"]),
            status=random.choice(["Needs Review", "Needs Review", "Resolved"]),
            resolution="Trusted source selected" if random.random() > 0.6 else None,
            resolved_by="R.K. Sharma" if random.random() > 0.6 else None
        ))
        diff_count += 1
    print(f"    Created {diff_count} differences")

    # ---- TOPICS ----
    print("[9/12] Seeding topics...")
    topic_data = [
        ("Coal Production", 45, 320, "coal,production,output,tonnage,MT", "MCL,WCL,NCL,SECL,CCL,BCCL,ECL"),
        ("Geological Exploration", 22, 150, "geology,exploration,drilling,survey,reserve", "MCL,NCL,SECL"),
        ("Mine Development", 18, 95, "development,expansion,new mine,project", "MCL,CCL,NCL"),
        ("Safety", 30, 210, "safety,incident,accident,prevention,training", "MCL,WCL,NCL,SECL,CCL,BCCL,ECL"),
        ("Equipment", 20, 130, "equipment,machinery,HEMM,shovel,dumper", "MCL,SECL,NCL"),
        ("Environment", 15, 85, "environment,pollution,reclamation,green,plantation", "MCL,WCL,ECL"),
        ("Production Planning", 25, 180, "planning,target,forecast,schedule,allocation", "MCL,WCL,NCL,SECL"),
        ("Mineral Reserves", 12, 65, "reserve,resource,estimation,grade,quality", "MCL,NCL,SECL"),
        ("Infrastructure", 10, 55, "infrastructure,road,railway,siding,conveyor", "MCL,SECL"),
        ("Workforce", 14, 78, "workforce,manpower,employee,training,skill", "MCL,WCL,CCL,BCCL"),
        ("Overburden Management", 18, 120, "overburden,stripping,ratio,dump,OB", "MCL,NCL,SECL"),
        ("Coal Quality", 16, 95, "quality,grade,GCV,ash,moisture", "MCL,WCL,NCL"),
        ("Financial Performance", 20, 140, "revenue,cost,profit,expenditure,budget", "MCL,WCL,NCL,SECL,CCL,BCCL,ECL"),
        ("Coal Dispatch", 22, 160, "dispatch,offtake,loading,siding,rake", "MCL,SECL,NCL"),
        ("Land Acquisition", 8, 42, "land,acquisition,R&R,rehabilitation,forest", "MCL,CCL"),
        ("Drilling & Blasting", 12, 70, "drilling,blasting,explosive,detonator", "MCL,NCL,SECL"),
        ("Water Management", 10, 55, "water,pumping,dewatering,effluent,discharge", "MCL,WCL,ECL"),
        ("Reclamation", 9, 48, "reclamation,restoration,plantation,backfilling", "MCL,WCL"),
        ("Regulatory Compliance", 11, 62, "compliance,regulation,DGMS,MOEF,clearance", "MCL,WCL,NCL"),
        ("Technology Adoption", 7, 35, "technology,GPS,drone,automation,digital", "MCL,SECL"),
        ("Community Development", 6, 30, "community,CSR,development,welfare,social", "MCL,CCL,ECL"),
    ]
    for t_name, doc_c, ment_c, kw, subs in topic_data:
        db.add(Topic(name=t_name, document_count=doc_c, mention_count=ment_c,
                     keywords=kw, related_subsidiaries=subs, related_mines=""))

    # ---- REPORTS ----
    print("[10/12] Seeding reports...")
    report_types = ["Production Report", "Geological Report", "Mining Performance Report",
                    "Safety Report", "Executive Summary"]
    for i in range(1, 8):
        sub = SUBSIDIARIES[i - 1][0]
        db.add(Report(
            report_id=f"RPT-{i:03d}",
            title=f"Production Report 2024 - {sub}",
            report_type="Production Report",
            year=2024, subsidiary=sub,
            created_by="R.K. Sharma",
            created_at=datetime(2024, 4, random.randint(1, 28)),
            status="Generated",
            source_count=random.randint(3, 8)
        ))

    # ---- AI QUESTIONS ----
    print("[11/12] Seeding AI question history (100+)...")
    ai_questions_data = [
        ("What was MCL production in 2024?",
         "MCL production for 2024 was 182.0 MT against a target of 180.0 MT, achieving 101.1%.",
         json.dumps([{"document": "Annual Mining Report 2024 - MCL", "page": "Page 27", "doc_id": "DOC-1001"}])),
        ("Compare MCL and WCL production",
         "MCL production in 2024 was 182.0 MT while WCL production was 55.0 MT. MCL produced approximately 3.3 times more coal than WCL.",
         json.dumps([{"document": "Annual Mining Report 2024 - MCL", "page": "Page 27"},
                     {"document": "Annual Mining Report 2024 - WCL", "page": "Page 15"}])),
        ("What are the main topics in the mining reports?",
         "The main topics found across mining reports include: Coal Production (320 mentions), Safety (210 mentions), Production Planning (180 mentions), Coal Dispatch (160 mentions), and Geological Exploration (150 mentions).",
         json.dumps([])),
        ("Show production from 2020 to 2024",
         "MCL Production Trend:\n2020: 148.0 MT\n2021: 157.0 MT\n2022: 168.0 MT\n2023: 176.0 MT\n2024: 182.0 MT\n\nThis shows a consistent growth of approximately 5-6% year over year.",
         json.dumps([{"document": "Annual Mining Report 2024 - MCL", "page": "Page 42"}])),
        ("What differences were found?",
         "The system found 54 differences across documents. Key differences include:\n1. Coal Production value mismatch: 5.2 MT vs 5.8 MT (MCL, 2024)\n2. Report year inconsistency: 2024 vs 2023\n3. Mine assignment conflict between MCL and WCL\n\n4 differences are marked as High priority.",
         json.dumps([])),
        ("What was the production target for NCL?",
         "NCL's production target for 2024 was 126.0 MT. Actual production was 124.0 MT, achieving 98.4% of the target.",
         json.dumps([{"document": "Annual Mining Report 2024 - NCL", "page": "Page 12"}])),
        ("Summarize the 2024 mining report",
         "The 2024 mining reports across all CIL subsidiaries show total coal production of approximately 682 MT. MCL led production at 182.0 MT followed by SECL at 160.0 MT and NCL at 124.0 MT. Overall target achievement was approximately 100.3%. Safety incidents showed improvement with a 12% reduction from the previous year.",
         json.dumps([{"document": "Annual Mining Report 2024 - MCL", "page": "Page 1"},
                     {"document": "Annual Mining Report 2024 - SECL", "page": "Page 1"}])),
    ]
    for q, a, s in ai_questions_data:
        db.add(AIQuestion(question=q, answer=a, sources=s, asked_by="R.K. Sharma"))

    # Fill to 100+ AI questions
    sample_questions = [
        "What is the coal dispatch for {sub} in {yr}?",
        "How many safety incidents in {sub} during {yr}?",
        "What is the overburden removal ratio for {sub}?",
        "Show revenue trend for {sub}",
        "What is the manpower deployed at {sub}?",
        "Compare production targets across subsidiaries in {yr}",
        "What equipment is used at {sub}?",
        "Show geological reserves for {sub}",
        "What are the environmental measures at {sub}?",
        "What is the land acquisition status for {sub}?",
    ]
    for i in range(100):
        sub = random.choice(SUBSIDIARIES)[0]
        yr = random.choice(YEARS)
        q_template = random.choice(sample_questions)
        q = q_template.format(sub=sub, yr=yr)
        db.add(AIQuestion(
            question=q,
            answer=f"Based on available documents, {sub} data for {yr} shows relevant information in the uploaded reports.",
            sources=json.dumps([]),
            asked_by=random.choice(["R.K. Sharma", "P. Verma", "A. Singh"]),
            asked_at=datetime(yr, random.randint(1, 12), random.randint(1, 28))
        ))

    # ---- NOTIFICATIONS ----
    print("[12/12] Seeding notifications & activity history...")
    notif_data = [
        ("reporting", "3 differences need your attention", "warning", "/differences"),
        ("reporting", "Annual Mining Report 2024 processed successfully", "success", "/documents"),
        ("reporting", "Production Report 2024 - MCL is ready for review", "info", "/documents"),
        ("admin", "New user P. Verma registered", "info", "/users"),
        ("analyst", "Word cloud updated with latest documents", "info", "/wordcloud"),
    ]
    for user, msg, ntype, link in notif_data:
        db.add(Notification(user=user, message=msg, type=ntype, link=link))

    # ---- ACTIVITY HISTORY ----
    actions = [
        ("R.K. Sharma", "Logged In", "Login", "", "Completed", ""),
        ("R.K. Sharma", "Uploaded Document", "Documents", "DOC-1001", "Completed", "Annual Mining Report 2024 - MCL"),
        ("R.K. Sharma", "Processed Document", "Documents", "DOC-1001", "Completed", "36 fields extracted, 2 differences found"),
        ("R.K. Sharma", "Reviewed Difference", "Differences", "D-001", "Completed", "Coal Production: 5.2 MT vs 5.8 MT"),
        ("R.K. Sharma", "Resolved Difference", "Differences", "D-002", "Completed", "Same value confirmed: 5.2 MT = 5,200,000 KG"),
        ("P. Verma", "Asked AI Question", "Ask AI", "", "Completed", "What was MCL production in 2024?"),
        ("R.K. Sharma", "Generated Report", "Reports", "RPT-001", "Completed", "Production Report 2024 - MCL"),
        ("R.K. Sharma", "Downloaded Report", "Reports", "RPT-001", "Completed", "PDF format"),
        ("P. Verma", "Searched Documents", "Smart Search", "", "Completed", "Query: production of MCL in 2024"),
        ("A. Singh", "Viewed Dashboard", "Dashboard", "", "Completed", ""),
    ]
    base_time = datetime(2026, 9, 21, 10, 0, 0)
    for i, (user, action, page, item, status, details) in enumerate(actions):
        db.add(ActivityHistory(
            timestamp=base_time + timedelta(minutes=i * 15),
            user=user, action=action, page=page, item=item, status=status, details=details
        ))

    # Fill to 100+ activity records
    activity_actions = [
        ("Logged In", "Login"), ("Viewed Dashboard", "Dashboard"),
        ("Uploaded Document", "Documents"), ("Processed Document", "Documents"),
        ("Viewed Document", "Documents"), ("Searched Documents", "Smart Search"),
        ("Asked AI Question", "Ask AI"), ("Generated Report", "Reports"),
        ("Reviewed Difference", "Differences"), ("Viewed Analytics", "Analytics"),
    ]
    for i in range(100):
        user = random.choice(["R.K. Sharma", "P. Verma", "A. Singh", "System Administrator"])
        action, page = random.choice(activity_actions)
        db.add(ActivityHistory(
            timestamp=base_time - timedelta(days=random.randint(0, 365), hours=random.randint(0, 23)),
            user=user, action=action, page=page, item="", status="Completed", details=""
        ))

    db.commit()
    db.close()

    total_docs = len(all_docs)
    print(f"\n{'=' * 60}")
    print(f"  Seeding Complete!")
    print(f"  Documents:    {total_docs}")
    print(f"  Information:  {info_count}")
    print(f"  Differences:  {diff_count}")
    print(f"  Topics:       {len(topic_data)}")
    print(f"  AI Questions: {len(ai_questions_data) + 100}")
    print(f"  Activities:   {len(actions) + 100}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    seed()
