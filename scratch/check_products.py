import urllib.request
import json

try:
    req = urllib.request.urlopen('http://localhost:8081/api/public/products')
    data = json.loads(req.read().decode())
    print('Total DB products:', len(data))
    for p in data:
        imgs = [(i.get('id'), i.get('colorLabel'), i.get('imageUrl')) for i in p.get('images', [])]
        print(f"ID: {p.get('id')} | Name: '{p.get('name')}' | Cat: '{p.get('category',{}).get('name')}' | Color: '{p.get('color')}' | Dim: '{p.get('dimensions')}' | Imgs: {imgs}")
except Exception as e:
    print('Error:', e)
