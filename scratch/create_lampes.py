import urllib.request
import json

# Login
login_data = json.dumps({"username": "admin", "password": "adminpassword"}).encode('utf-8')
login_req = urllib.request.Request('http://localhost:8081/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

# Get categories
req_c = urllib.request.Request('http://localhost:8081/api/public/categories')
with urllib.request.urlopen(req_c) as resp:
    categories = json.loads(resp.read().decode('utf-8'))
    print("Categories sample:", json.dumps(categories[:3], indent=2))

# Create Lampes with type FURNITURE
payload = {
    "name": "Lampes",
    "type": "FURNITURE"
}

create_req = urllib.request.Request(
    'http://localhost:8081/api/admin/categories',
    data=json.dumps(payload).encode('utf-8'),
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(create_req) as res:
        created = json.loads(res.read().decode('utf-8'))
        print("[SUCCESS] Category created:", created)
except Exception as e:
    print("[ERROR] Failed to create Lampes:", e)
