import urllib.request
import json

# 1. Login as Admin
login_data = json.dumps({
    "username": "admin",
    "password": "adminpassword"
}).encode('utf-8')

login_req = urllib.request.Request(
    'http://localhost:8081/api/auth/login',
    data=login_data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(login_req) as resp:
        token = json.loads(resp.read().decode('utf-8')).get('token')
        print("[SUCCESS] Logged in as Admin")
except Exception as e:
    print("[ERROR] Login failed:", e)
    token = None

# 2. Get Categories
req_c = urllib.request.Request('http://localhost:8081/api/public/categories')
try:
    with urllib.request.urlopen(req_c) as resp:
        categories = json.loads(resp.read().decode('utf-8'))
        print("\n--- EXISTING CATEGORIES ---")
        for c in categories:
            print(f"ID: {c.get('id')} | Name: '{c.get('name')}' | Description: '{c.get('description')}'")
except Exception as e:
    print("[ERROR] Failed to fetch categories:", e)
    categories = []

# 3. Check if 'Lampes' and 'Coffres' exist, if not create them
cat_names = [c.get('name').lower() for c in categories]

needed = [
    {"name": "Lampes", "description": "Lampes et luminaires artisanaux d'art sur-mesure"},
    {"name": "Coffres", "description": "Coffres traditionnels et contemporains sculptés"}
]

if token:
    for cat in needed:
        exists = any(cat["name"].lower() in c_name or c_name in cat["name"].lower() for c_name in cat_names)
        if not exists:
            print(f"Creating category '{cat['name']}'...")
            create_req = urllib.request.Request(
                'http://localhost:8081/api/admin/categories',
                data=json.dumps(cat).encode('utf-8'),
                headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                method='POST'
            )
            try:
                with urllib.request.urlopen(create_req) as res:
                    created = json.loads(res.read().decode('utf-8'))
                    print(f"[CREATED] ID: {created.get('id')} -> {created.get('name')}")
            except Exception as ex:
                print(f"[ERROR] Failed to create {cat['name']}:", ex)
        else:
            print(f"[EXISTS] Category matching '{cat['name']}' already exists.")
