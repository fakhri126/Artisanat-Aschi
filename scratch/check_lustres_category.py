import urllib.request
import json

# 1. Login
login_data = json.dumps({"username": "admin", "password": "adminpassword"}).encode('utf-8')
login_req = urllib.request.Request('http://localhost:8081/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

# 2. Get categories
cat_req = urllib.request.Request('http://localhost:8081/api/public/categories')
with urllib.request.urlopen(cat_req) as resp:
    categories = json.loads(resp.read().decode('utf-8'))

print("Current Categories in DB:")
for c in categories:
    print(f"ID: {c.get('id')} | Name: '{c.get('name')}'")

lustre_cat = next((c for c in categories if 'lustre' in c.get('name', '').lower()), None)

if not lustre_cat:
    # Create Category Lustres
    create_req = urllib.request.Request(
        'http://localhost:8081/api/admin/categories',
        data=json.dumps({"name": "Lustres", "description": "Lustres et suspensions artisanales d'art en bois sculpté et céramique"}).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(create_req) as res:
        new_cat = json.loads(res.read().decode('utf-8'))
        print(f"Created category 'Lustres' with ID: {new_cat.get('id')}")
else:
    print(f"Category 'Lustres' already exists with ID: {lustre_cat.get('id')}")
