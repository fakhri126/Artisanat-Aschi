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

for p in products:
    pid = p.get('id')
    cat_name = p.get('category', {}).get('name')
    color = p.get('color') or ''
    dim = p.get('dimensions') or ''
    cat_id = p.get('category', {}).get('id')
    imgs = p.get('images', [])

    if cat_name == 'Buffets':
        # Determine exact clean name: Buffet + Color + Dim
        c_clean = "Blanc" if ("blanc" in color.lower() or "cérusé" in color.lower()) else ("Or" if ("or" in color.lower() or "jaune" in color.lower() or "doré" in color.lower()) else color)
        d_clean = dim.capitalize() if dim else "Moyen"
        clean_name = f"Buffet {c_clean} {d_clean}"
        
        payload = {
            "name": clean_name,
            "description": p.get('description') or f"Buffet artisanal fait-main en bois massif et céramique tunisienne ({color} - {dim}).",
            "categoryId": cat_id,
            "dimensions": dim,
            "materials": "Bois massif & Céramique d'art",
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
                print(f"[OK] Product {pid} -> '{clean_name}'")
        except Exception as ex:
            print(f"[ERROR] {pid}:", ex)

print("\n[SUCCESS] All products renamed to clean, standard names!")
