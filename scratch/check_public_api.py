import urllib.request
import json

try:
    url = 'http://localhost:8081/api/public/products?type=CATALOGUE'
    req = urllib.request.urlopen(url)
    data = json.loads(req.read().decode('utf-8'))
    print(f"Products with type=CATALOGUE: {len(data)}")
    for p in data:
        print(f"ID: {p.get('id')} | Name: '{p.get('name')}' | Cat: '{p.get('category', {}).get('name')}' | Type: '{p.get('type')}' | Imgs: {len(p.get('images', []))}")
except Exception as e:
    print("Error:", e)

try:
    url2 = 'http://localhost:8081/api/public/products'
    req2 = urllib.request.urlopen(url2)
    data2 = json.loads(req2.read().decode('utf-8'))
    print(f"\nAll Public Products: {len(data2)}")
    buffets = [p for p in data2 if p.get('category', {}).get('name') == 'Buffets']
    print(f"Buffets count: {len(buffets)}")
    for b in buffets:
        print(f"  - [{b.get('id')}] '{b.get('name')}' (Type: {b.get('type')}) | Imgs: {len(b.get('images', []))}")
except Exception as e:
    print("Error 2:", e)
