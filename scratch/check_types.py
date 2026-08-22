import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products')
products = json.loads(req.read().decode())

for p in products:
    cat = p.get('category', {}).get('name')
    if cat in ['Buffets', 'Miroirs', 'Meubles TV', 'Coffres', 'Portes']:
        print(f"ID: {p.get('id'):<4} | Type: {p.get('type'):<15} | Cat: {cat:<12} | Name: '{p.get('name')}' | Color: '{p.get('color')}' | Dim: '{p.get('dimensions')}' | Imgs: {len(p.get('images', []))}")
