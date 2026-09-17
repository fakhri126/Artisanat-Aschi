import urllib.request
import json
import re

# 1. Login
login_data = json.dumps({"username": "admin", "password": "adminpassword"}).encode('utf-8')
login_req = urllib.request.Request('http://localhost:8081/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')

# 2. Get all products
req_p = urllib.request.Request('http://localhost:8081/api/public/products')
with urllib.request.urlopen(req_p) as resp:
    products = json.loads(resp.read().decode('utf-8'))

print(f"Total products to sanitize: {len(products)}")

updated = 0
for p in products:
    p_id = p.get('id')
    raw_name = p.get('name', '')
    
    # Strip any null bytes or non-printable garbage
    clean_name = "".join(c for c in raw_name if ord(c) >= 32 or c in '\t\n\r')
    clean_name = clean_name.replace('Modlle', 'Modèle').replace('Modle', 'Modèle').replace('Modele', 'Modèle')
    
    # Extract number if present
    match = re.search(r'(\d+)', clean_name)
    cat_name = (p.get('category', {}) or {}).get('name', '')
    
    if 'buffet' in clean_name.lower() or 'buffet' in cat_name.lower():
        if match:
            num = match.group(1).zfill(2)
            clean_name = f"Buffet — Modèle {num}"
    elif 'lampe' in clean_name.lower() or 'coffre' in clean_name.lower() or 'lampe' in cat_name.lower():
        if match:
            num = match.group(1).zfill(2)
            clean_name = f"Lampe Coffre — Modèle {num}"
    elif 'tv' in clean_name.lower() or 'tv' in cat_name.lower():
        if match:
            num = match.group(1).zfill(2)
            clean_name = f"Meuble TV — Modèle {num}"
    elif 'porte' in clean_name.lower() and not 'bijoux' in cat_name.lower():
        if match:
            num = match.group(1).zfill(2)
            clean_name = f"Porte — Modèle {num}"
    elif 'miroir' in clean_name.lower() or 'miroir' in cat_name.lower():
        if match:
            num = match.group(1).zfill(2)
            clean_name = f"Miroir — Modèle {num}"
            
    clean_name = re.sub(r'\s+', ' ', clean_name).strip()
    
    cat_id = (p.get('category', {}) or {}).get('id')
    if not cat_id:
        continue
        
    payload = {
        "name": clean_name,
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
        data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json; charset=utf-8'},
        method='PUT'
    )
    try:
        with urllib.request.urlopen(up_req) as res:
            updated += 1
    except Exception as ex:
        print(f"[ERROR] ID {p_id}:", ex)

print(f"Sanitization complete! Updated {updated} products.")
