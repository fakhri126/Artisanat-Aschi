import urllib.request
import json

# Login
login_data = json.dumps({"username": "admin", "password": "adminpassword"}).encode('utf-8')
login_req = urllib.request.Request('http://localhost:8081/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

# Update category ID 5 to "Lampes Coffres"
print("Updating category ID 5 to 'Lampes Coffres'...")
up_req = urllib.request.Request(
    "http://localhost:8081/api/admin/categories/5",
    data=json.dumps({"name": "Lampes Coffres", "type": "FURNITURE"}).encode('utf-8'),
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
    method='PUT'
)

with urllib.request.urlopen(up_req) as res:
    print("[UPDATED]", json.loads(res.read().decode('utf-8')))

# Check final categories
req_c = urllib.request.Request('http://localhost:8081/api/public/categories')
with urllib.request.urlopen(req_c) as resp:
    categories = json.loads(resp.read().decode('utf-8'))

print("\nFinal Categories in DB:")
for c in categories:
    print(f"ID: {c.get('id')} | Name: '{c.get('name')}'")
