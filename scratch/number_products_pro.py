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

# 2. Get all catalogue products
req_p = urllib.request.Request('http://localhost:8081/api/public/products?type=CATALOGUE')
with urllib.request.urlopen(req_p) as resp:
    products = json.loads(resp.read().decode('utf-8'))

# Separate into categories
buffets = [p for p in products if p.get('category', {}).get('name') == 'Buffets']

def get_color_rank(p):
    c = (p.get('color') or '').lower()
    if 'blanc' in c or 'cérusé' in c: return 1
    if 'or' in c or 'doré' in c or 'jaune' in c: return 2
    if 'noyer' in c or 'naturel' in c or 'bois' in c: return 3
    if 'bleu' in c: return 4
    return 5

def get_size_rank(p):
    d = (p.get('dimensions') or '').lower()
    if 'petit' in d: return 1
    if 'moyen' in d: return 2
    if 'grand' in d: return 3
    return 4

buffets_sorted = sorted(buffets, key=lambda x: (get_color_rank(x), get_size_rank(x), x.get('id', 0)))

print(f"Total Buffets to number: {len(buffets_sorted)}")

# We assign professional numbered titles: "Buffet N° 01", "Buffet N° 02", etc.
for idx, p in enumerate(buffets_sorted, start=1):
    pid = p.get('id')
    color = p.get('color')
    dim = p.get('dimensions')
    cat_id = p.get('category', {}).get('id')
    imgs = p.get('images', [])
    
    num_str = f"{idx:02d}" # "01", "02", ..., "36"
    pro_name = f"Buffet N° {num_str}"
    
    payload = {
        "name": pro_name,
        "description": f"Buffet artisanal sculpté fait-main (Modèle N° {num_str}) — Finition {color}, format {dim}.",
        "categoryId": cat_id,
        "dimensions": dim,
        "materials": "Bois massif noble & Céramique",
        "color": color,
        "price": p.get('price'),
        "availability": "Sur commande",
        "type": "CATALOGUE",
        "isFeatured": True,
        "imageVariants": [{"imageUrl": img.get('imageUrl'), "colorLabel": "Original"} for img in imgs]
    }
    
    up_req = urllib.request.Request(
        f'http://localhost:8081/api/admin/products/{pid}',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='PUT'
    )
    try:
        with urllib.request.urlopen(up_req) as up_res:
            print(f"[OK] Product {pid} -> '{pro_name}' ({color} | {dim})")
    except Exception as ex:
        print(f"[ERROR] {pid}:", ex)

print("\n[SUCCESS] All buffets numbered with clean professional identifiers!")
