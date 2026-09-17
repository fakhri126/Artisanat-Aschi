import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products?type=CATALOGUE')
products = json.loads(req.read().decode('utf-8'))

for p in sorted(products, key=lambda x: (x.get('category', {}).get('name', ''), x.get('name', ''))):
    cat = p.get('category', {}).get('name')
    imgs = [i.get('imageUrl') for i in p.get('images', [])]
    print(f"[{p.get('id'):<3}] Cat: {cat:<10} | Name: {p.get('name'):<30} | Color: {str(p.get('color')):<15} | Dim: {str(p.get('dimensions')):<10} | Imgs: {len(imgs)}")
