import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products?type=CATALOGUE')
products = json.loads(req.read().decode('utf-8'))

def is_handle_product_fixed(p):
    cat_name = (p.get('category', {}).get('name') or '').lower()
    name = (p.get('name') or '').lower()
    return (
        "bijoux de porte" in cat_name or
        "ronds" in cat_name or
        "ovales" in cat_name or
        "poignée" in cat_name or
        "poignee" in cat_name or
        "bouton majolique" in name or
        "petite poignée" in name or
        "grand rond" in name or
        "bouton ovale" in name
    )

filtered = [p for p in products if not is_handle_product_fixed(p)]
print(f"Total catalog products after fix: {len(filtered)}")
buffets = [p for p in filtered if (p.get('category', {}).get('name') or '').lower() == 'buffets']
print(f"Buffet products after fix: {len(buffets)}")
