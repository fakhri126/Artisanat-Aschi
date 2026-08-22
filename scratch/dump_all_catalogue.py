import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products?type=CATALOGUE')
products = json.loads(req.read().decode('utf-8'))

print(f"Total CATALOGUE products: {len(products)}")
for p in products:
    cat = p.get('category', {}).get('name')
    imgs = [img.get('imageUrl') for img in p.get('images', [])]
    print(f"ID: {p.get('id'):<4} | Cat: {cat:<10} | Color: {str(p.get('color')):<15} | Dim: {str(p.get('dimensions')):<10} | Name: '{p.get('name')}' | Img: {imgs[0] if imgs else 'None'}")
