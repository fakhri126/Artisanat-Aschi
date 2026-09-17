import urllib.request
import json

req = urllib.request.urlopen('http://localhost:8081/api/public/products')
products = json.loads(req.read().decode())

for p in products:
    cat = p.get('category', {}).get('name')
    if cat == 'Buffets':
        print(f"\n==========================================")
        print(f"Product ID: {p.get('id')} | Name: '{p.get('name')}' | Color: '{p.get('color')}' | Dim: '{p.get('dimensions')}' | Type: '{p.get('type')}'")
        imgs = p.get('images', [])
        print(f"Total Images: {len(imgs)}")
        for idx, img in enumerate(imgs):
            print(f"   [{idx+1}] ID: {img.get('id')} | colorLabel: '{img.get('colorLabel')}' | URL: {img.get('imageUrl')}")
