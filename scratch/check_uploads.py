import os
import glob
from PIL import Image, ImageDraw, ImageFilter, ImageFont

uploads = glob.glob(r'backend\uploads\*')
print('Total uploads:', len(uploads))

# Find the two images
f_face = None
f_top = None

for u in uploads:
    if '519f1bb0' in u:
        f_face = u
    if 'e30b3bc5' in u:
        f_top = u

print('f_face:', f_face)
print('f_top:', f_top)

if f_face and f_top:
    im_face = Image.open(f_face).convert('RGB')
    im_top = Image.open(f_top).convert('RGB')
    print('im_face size:', im_face.size)
    print('im_top size:', im_top.size)
