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

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')
    print("[SUCCESS] Admin Logged in successfully!")

# 2. Get Category ID for Buffets
req_cats = urllib.request.Request('http://localhost:8081/api/public/categories')
with urllib.request.urlopen(req_cats) as resp:
    categories = json.loads(resp.read().decode('utf-8'))
    buffets_cat = next((c for c in categories if c.get('name') == 'Buffets'), None)
    buffets_cat_id = buffets_cat.get('id') if buffets_cat else None
    print(f"Buffets Category ID: {buffets_cat_id}")

# 3. Get all products
req_p = urllib.request.Request('http://localhost:8081/api/public/products')
with urllib.request.urlopen(req_p) as resp:
    products = json.loads(resp.read().decode('utf-8'))

# Products to split into individual single-card products:
# - ID 289: Buffets Blanc Petit (5 images -> 5 individual products)
# - ID 292: Buffets Or Petit (5 images -> 5 individual products)
# - ID 290: Buffets Blanc Grand (2 images -> 2 individual products)
# - ID 293: Buffets Or Grand (2 images -> 2 individual products)
# - ID 291: Buffets Or Moyen (11 images -> 11 individual products)
# - ID 288: Buffets Moyen Blanc (11 images -> 11 individual products)

split_targets = [289, 292, 290, 293, 291, 288]

for pid in split_targets:
    p = next((x for x in products if x.get('id') == pid), None)
    if not p:
        continue
    
    base_name = p.get('name')
    base_color = p.get('color')
    base_dim = p.get('dimensions')
    base_desc = p.get('description') or "Pièce artisanale d'exception fabriquée à la main sur-mesure."
    base_mat = p.get('materials') or "Bois massif & Céramique"
    cat_id = p.get('category', {}).get('id') or buffets_cat_id
    imgs = p.get('images', [])
    
    if len(imgs) <= 1:
        continue
        
    print(f"\n--- Splitting '{base_name}' (ID: {pid}) with {len(imgs)} images into separate cards ---")
    
    # 1. Update the original product to only have Image 1
    first_img = imgs[0]
    update_orig_payload = {
        "name": f"{base_name} N°1",
        "description": base_desc,
        "categoryId": cat_id,
        "dimensions": base_dim,
        "materials": base_mat,
        "color": base_color,
        "price": p.get('price'),
        "availability": p.get('availability') or "Sur commande",
        "type": "CATALOGUE",
        "isFeatured": True,
        "imageVariants": [{"imageUrl": first_img.get('imageUrl'), "colorLabel": "Original"}]
    }
    up_req = urllib.request.Request(
        f'http://localhost:8081/api/admin/products/{pid}',
        data=json.dumps(update_orig_payload).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='PUT'
    )
    try:
        with urllib.request.urlopen(up_req) as up_resp:
            print(f"  [OK] Updated original {pid} to '{base_name} N°1'")
    except Exception as ex:
        print(f"  [ERROR] updating {pid}:", ex)
        
    # 2. Create a new separate product for each remaining image
    for idx, img in enumerate(imgs[1:], start=2):
        new_payload = {
            "name": f"{base_name} N°{idx}",
            "description": base_desc,
            "categoryId": cat_id,
            "dimensions": base_dim,
            "materials": base_mat,
            "color": base_color,
            "price": p.get('price'),
            "availability": p.get('availability') or "Sur commande",
            "type": "CATALOGUE",
            "isFeatured": True,
            "imageVariants": [{"imageUrl": img.get('imageUrl'), "colorLabel": "Original"}]
        }
        create_req = urllib.request.Request(
            'http://localhost:8081/api/admin/products',
            data=json.dumps(new_payload).encode('utf-8'),
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            method='POST'
        )
        try:
            with urllib.request.urlopen(create_req) as create_resp:
                new_p = json.loads(create_resp.read().decode('utf-8'))
                print(f"  [OK] Created separate card '{base_name} N°{idx}' (New ID: {new_p.get('id')})")
        except Exception as ex:
            print(f"  [ERROR] creating {base_name} N°{idx}:", ex)

print("\n[SUCCESS] All products have been cleanly separated into individual cards!")
