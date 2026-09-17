import urllib.request
import json
import os
from PIL import Image

req = urllib.request.urlopen('http://localhost:8081/api/public/products')
products = json.loads(req.read().decode())

for p in products:
    cat = p.get('category', {}).get('name')
    if cat == 'Buffets':
        print(f"\n==========================================")
        print(f"Product ID: {p.get('id')} | Name: '{p.get('name')}' | Color: '{p.get('color')}' | Dim: '{p.get('dimensions')}'")
        imgs = p.get('images', [])
        for idx, img in enumerate(imgs):
            url = img.get('imageUrl')
            filename = os.path.basename(url)
            local_path = os.path.join('backend', 'uploads', filename)
            size = "unknown"
            if os.path.exists(local_path):
                try:
                    im = Image.open(local_path)
                    size = f"{im.size[0]}x{im.size[1]}"
                except:
                    pass
            print(f"   Image {idx+1} [ID {img.get('id')}]: {filename} ({size})")
