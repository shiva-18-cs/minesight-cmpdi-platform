import urllib.request
import json

def test():
    base_api = "http://127.0.0.1:8000"
    base_fe = "http://localhost:5173"

    print("--- TESTING BACKEND HEALTH ---")
    with urllib.request.urlopen(f"{base_api}/") as res:
        print("Root Status:", json.loads(res.read()))

    print("\n--- TESTING AUTH LOGIN ---")
    req = urllib.request.Request(
        f"{base_api}/auth/login",
        data=json.dumps({"username": "admin", "password": "admin123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        auth_data = json.loads(res.read())
        print("Logged In:", auth_data["full_name"], "| Role:", auth_data["role"])

    print("\n--- TESTING DASHBOARD METRICS ---")
    with urllib.request.urlopen(f"{base_api}/dashboard") as res:
        dash = json.loads(res.read())
        print(f"Total Docs: {dash['total_documents']}, Info: {dash['information_found']}, Differences: {dash['differences_found']}")

    print("\n--- TESTING SMART SEARCH ---")
    with urllib.request.urlopen(f"{base_api}/search?q=production") as res:
        srch = json.loads(res.read())
        print(f"Search 'production' -> Docs: {len(srch['documents'])}, Facts: {len(srch['information'])}, Topics: {len(srch['topics'])}")

    print("\n--- TESTING ASK AI ---")
    ai_req = urllib.request.Request(
        f"{base_api}/ai/query",
        data=json.dumps({"question": "What was MCL production in 2024?"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(ai_req) as res:
        ai_resp = json.loads(res.read())
        print("AI Answer:", ai_resp["answer"])

    print("\n--- TESTING WORD CLOUD ---")
    with urllib.request.urlopen(f"{base_api}/wordcloud") as res:
        wc = json.loads(res.read())
        print(f"Word cloud returned {len(wc)} words. Top 3: {wc[:3]}")

    print("\n--- TESTING TOPICS ---")
    with urllib.request.urlopen(f"{base_api}/topics") as res:
        topics = json.loads(res.read())
        if topics:
            print(f"Topics returned {len(topics)} topics. First: {topics[0]['name']}")
        else:
            print(f"Topics returned {len(topics)} topics (clean state)")

    print("\n--- TESTING REPORTS & EXPORT ---")
    with urllib.request.urlopen(f"{base_api}/reports") as res:
        reports = json.loads(res.read())
        print(f"Existing reports: {len(reports)}")
        if reports:
            rid = reports[0]["id"]
            with urllib.request.urlopen(f"{base_api}/reports/{rid}/export/json") as exp:
                print(f"Export Report #{rid} JSON status: {exp.status}")

    print("\n--- TESTING FRONTEND SERVER ---")
    with urllib.request.urlopen(f"{base_fe}/") as fe_res:
        print("Frontend Status Code:", fe_res.status)

    print("\n==========================================")
    print("ALL MODULES TESTED AND OPERATIONAL!")
    print("==========================================")

if __name__ == "__main__":
    test()
