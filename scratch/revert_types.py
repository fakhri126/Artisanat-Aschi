import urllib.request
import json
import os

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

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

# 2. Revert previous types for Coffre (2), Buffet Carthage (5), Meuble TV (6)
reverts = [
    (2, "PIECE_UNIQUE"),
    (5, "REPRODUCTIBLE"),
    (6, "REPRODUCTIBLE")
]

for pid, orig_type in reverts:
    # Get product
    p_req = urllib.request.Request(f'http://localhost:8081/api/public/products/{pid}')
    try:
        with urllib.request.urlopen(p_req) as p_resp:
            p = json.loads(p_resp.read().decode('utf-8'))
            up_payload = {
                "name": p.get('name'),
                "description": p.get('description'),
                "categoryId": p.get('category', {}).get('id'),
                "dimensions": p.get('dimensions'),
                "materials": p.get('materials'),
                "color": p.get('color'),
                "price": p.get('price'),
                "availability": p.get('availability'),
                "type": orig_type,
                "isFeatured": p.get('isFeatured', True),
                "imageVariants": [{"imageUrl": img.get('imageUrl'), "colorLabel": img.get('colorLabel')} for img in p.get('images', [])]
            }
            up_req = urllib.request.Request(
                f'http://localhost:8081/api/admin/products/{pid}',
                data=json.dumps(up_payload).encode('utf-8'),
                headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                method='PUT'
            )
            with urllib.request.urlopen(up_req) as up_res:
                print(f"[REVERT OK] Reverted product {pid} to type '{orig_type}'")
    except Exception as e:
        print(f"[REVERT ERROR] {pid}:", e)
