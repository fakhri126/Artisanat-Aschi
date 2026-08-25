import urllib.request
import json

req = urllib.request.Request('http://localhost:8081/api/public/products')
try:
    with urllib.request.urlopen(req) as resp:
        products = json.loads(resp.read().decode('utf-8'))
        print(f"Total products: {len(products)}")
        for p in products[:15]:
            print(f"ID: {p.get('id')} | Name: '{p.get('name')}' | Category: '{p.get('category', {}).get('name')}' | Color: '{p.get('color')}' | Dim: '{p.get('dimensions')}'")
except Exception as e:
    print("Error:", e)
