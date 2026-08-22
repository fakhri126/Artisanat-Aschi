import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products')
products = json.loads(req.read().decode())

cats = {}
for p in products:
    cname = p.get('category', {}).get('name', 'Sans catégorie')
    if cname not in cats:
        cats[cname] = []
    cats[cname].append((p.get('id'), p.get('name'), p.get('color'), p.get('dimensions'), len(p.get('images', []))))

for cname, plist in cats.items():
    print(f"=== Catégorie: {cname} ({len(plist)} produits) ===")
    for pid, name, color, dim, img_count in plist:
        print(f"  - [{pid}] {name} | Couleur: {color} | Dim: {dim} | {img_count} images")
