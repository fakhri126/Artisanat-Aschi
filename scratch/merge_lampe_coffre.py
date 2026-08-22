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

print("Current Categories:")
for c in categories:
    print(f"ID: {c.get('id')} | Name: '{c.get('name')}'")

# We want ONE single category: "Lampes & Coffres" (or "Lampe & Coffre")
# Check for ID 5 (Coffres) and ID 13 (Lampes)
coffre_cat = next((c for c in categories if c.get('name').lower() == 'coffres' or c.get('name').lower() == 'coffre'), None)
lampe_cat = next((c for c in categories if c.get('name').lower() == 'lampes' or c.get('name').lower() == 'lampe'), None)

# 1. Update coffre_cat to "Lampes & Coffres"
if coffre_cat:
    print(f"Updating category ID {coffre_cat['id']} to 'Lampes & Coffres'...")
    up_req = urllib.request.Request(
        f"http://localhost:8081/api/admin/categories/{coffre_cat['id']}",
        data=json.dumps({"name": "Lampes & Coffres", "type": "FURNITURE"}).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='PUT'
    )
    with urllib.request.urlopen(up_req) as res:
        print("[UPDATED]", json.loads(res.read().decode('utf-8')))

# 2. Delete separate lampe_cat if exists
if lampe_cat and lampe_cat['id'] != coffre_cat['id']:
    print(f"Deleting separate category ID {lampe_cat['id']} ({lampe_cat['name']})...")
    del_req = urllib.request.Request(
        f"http://localhost:8081/api/admin/categories/{lampe_cat['id']}",
        headers={'Authorization': f'Bearer {token}'},
        method='DELETE'
    )
    try:
        with urllib.request.urlopen(del_req) as res:
            print("[DELETED] Status:", res.status)
    except Exception as ex:
        print("[DELETE ERROR]", ex)

# Verify updated categories
req_c2 = urllib.request.Request('http://localhost:8081/api/public/categories')
with urllib.request.urlopen(req_c2) as resp:
    categories2 = json.loads(resp.read().decode('utf-8'))
print("\nFinal Categories in DB:")
for c in categories2:
    print(f"ID: {c.get('id')} | Name: '{c.get('name')}'")
