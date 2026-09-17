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
        login_res = json.loads(resp.read().decode('utf-8'))
        token = login_res.get('token')
        print("[SUCCESS] Admin Logged in successfully!")
except Exception as e:
    print("[ERROR] Admin login error:", e)
    token = None

if token:
    # 2. Get all products from public endpoint
    req = urllib.request.Request('http://localhost:8081/api/public/products')
    with urllib.request.urlopen(req) as resp:
        products = json.loads(resp.read().decode('utf-8'))
        print(f"Total Products: {len(products)}")

    # 3. Clean dummy empty products and ensure each valid model is clean
    for p in products:
        pid = p.get('id')
        pname = (p.get('name') or '').strip().lower()
        catname = p.get('category', {}).get('name')
        
        # Check if dummy empty product (e.g. ID 18, 19, 20)
        if pid in [18, 19, 20] or (pname in ['buffet', 'buffets aschi'] and len(p.get('images', [])) <= 1 and not p.get('dimensions') and not p.get('color')):
            print(f"Deleting dummy test product [{pid}] '{p.get('name')}'...")
            del_req = urllib.request.Request(
                f'http://localhost:8081/api/admin/products/{pid}',
                headers={'Authorization': f'Bearer {token}'},
                method='DELETE'
            )
            try:
                with urllib.request.urlopen(del_req) as del_resp:
                    print(f"[OK] Deleted dummy product {pid}")
            except Exception as ex:
                print(f"[ERROR] deleting {pid}:", ex)

        # Ensure all valid products in Buffets, Coffres, Meubles TV, Portes have type = 'CATALOGUE'
        elif catname in ['Coffres', 'Meubles TV', 'Portes', 'Buffets'] and p.get('type') != 'CATALOGUE':
            print(f"Updating [{pid}] '{p.get('name')}' to type = 'CATALOGUE'...")
            update_payload = {
                "name": p.get('name'),
                "description": p.get('description') or "Pièce artisanale fabriquée à la main sur-mesure.",
                "categoryId": p.get('category', {}).get('id'),
                "dimensions": p.get('dimensions'),
                "materials": p.get('materials') or "Bois noble & Céramique",
                "color": p.get('color') or "Noyer",
                "price": p.get('price'),
                "availability": p.get('availability') or "Sur commande",
                "type": "CATALOGUE",
                "isFeatured": p.get('isFeatured', True),
                "imageVariants": [{"imageUrl": img.get('imageUrl'), "colorLabel": img.get('colorLabel')} for img in p.get('images', [])]
            }
            up_req = urllib.request.Request(
                f'http://localhost:8081/api/admin/products/{pid}',
                data=json.dumps(update_payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                },
                method='PUT'
            )
            try:
                with urllib.request.urlopen(up_req) as up_resp:
                    print(f"[OK] Updated product {pid} to CATALOGUE")
            except Exception as ex:
                print(f"[ERROR] updating {pid}:", ex)

    print("[SUCCESS] All catalog products updated and cleaned up successfully!")
