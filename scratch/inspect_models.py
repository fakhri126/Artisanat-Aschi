import urllib.request
import json
import os

req = urllib.request.urlopen('http://localhost:8081/api/public/products')
products = json.loads(req.read().decode())

for p in products:
    cat = p.get('category', {}).get('name')
    if cat == 'Buffets':
        print(f"\n==========================================")
        print(f"Product ID: {p.get('id')} | Name: '{p.get('name')}' | Color: '{p.get('color')}' | Dim: '{p.get('dimensions')}'")
        imgs = p.get('images', [])
        for idx, img in enumerate(imgs):
            print(f"   Image {idx+1}: {img.get('imageUrl')}")
