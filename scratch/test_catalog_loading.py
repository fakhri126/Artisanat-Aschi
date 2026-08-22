import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products?type=CATALOGUE')
products = json.loads(req.read().decode('utf-8'))

def is_handle_product(p):
    cat_name = (p.get('category', {}).get('name') or '').lower()
    mat = (p.get('materials') or '').lower()
    name = (p.get('name') or '').lower()
    return (
        "bijoux de porte" in cat_name or
        "ronds" in cat_name or
        "ovales" in cat_name or
        "poignée" in cat_name or
        "poigne" in cat_name or
        "céramique" in mat or
        "majolique" in mat or
        "bouton" in name or
        "poignée" in name or
        "poigne" in name
    )

filtered_db = [p for p in products if not is_handle_product(p)]
print(f"Products passed through is_handle_product filter: {len(filtered_db)}")

buffets = [p for p in filtered_db if (p.get('category', {}).get('name') or '').lower() == 'buffets']
print(f"Buffets available in catalogue: {len(buffets)}")
for b in buffets:
    print(f"  - [{b.get('id')}] {b.get('name')} | Color: {b.get('color')} | Dim: {b.get('dimensions')}")
