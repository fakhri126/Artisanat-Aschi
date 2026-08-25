import urllib.request
import json
import re

# 1. Login
login_data = json.dumps({"username": "admin", "password": "adminpassword"}).encode('utf-8')
login_req = urllib.request.Request('http://localhost:8081/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

# 2. Get all products via public API
req_p = urllib.request.Request('http://localhost:8081/api/public/products')
with urllib.request.urlopen(req_p) as resp:
    products = json.loads(resp.read().decode('utf-8'))

print(f"Total products to verify: {len(products)}")

updated_count = 0
for p in products:
    old_name = p.get('name', '')
    # Clean broken UTF-8/latin-1 markers or non-breaking spaces
    new_name = old_name.replace('', '—').replace('', '«').replace('', '»')
    new_name = re.sub(r'—\s*—+', '—', new_name)
    new_name = re.sub(r'\s+—\s+', ' — ', new_name)
    new_name = re.sub(r'\s+', ' ', new_name).strip()
    
    # If name changed, update product via PUT /api/admin/products/{id}
    if new_name != old_name:
        p_id = p.get('id')
        cat_id = p.get('category', {}).get('id')
        if not cat_id:
            continue
        
        payload = {
            "name": new_name,
            "description": p.get('description'),
            "categoryId": cat_id,
            "dimensions": p.get('dimensions'),
            "materials": p.get('materials'),
            "color": p.get('color'),
            "price": p.get('price'),
            "availability": p.get('availability', 'Disponible'),
            "type": p.get('type', 'CATALOGUE'),
            "isFeatured": p.get('isFeatured', False),
            "imageVariants": [
                {"imageUrl": img.get('imageUrl'), "colorLabel": img.get('colorLabel')}
                for img in p.get('images', [])
            ]
        }
        
        up_req = urllib.request.Request(
            f"http://localhost:8081/api/admin/products/{p_id}",
            data=json.dumps(payload).encode('utf-8'),
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            method='PUT'
        )
        try:
            with urllib.request.urlopen(up_req) as res:
                print(f"[UPDATED] ID {p_id}: '{old_name}' -> '{new_name}'")
                updated_count += 1
        except Exception as ex:
            print(f"[ERROR] ID {p_id}:", ex)

print(f"\nDone! Successfully updated {updated_count} product names.")
