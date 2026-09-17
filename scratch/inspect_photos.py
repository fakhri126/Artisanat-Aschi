import os
from PIL import Image

# Inspect media files
f1 = r'C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\3c8c1131-1dcb-4525-9972-6ce1774496c6\.user_uploaded\media_1786787896025.png'
f2 = r'C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\3c8c1131-1dcb-4525-9972-6ce1774496c6\.user_uploaded\media_1786787896560.png'

im1 = Image.open(f1)
im2 = Image.open(f2)

print('im1 size:', im1.size)
print('im2 size:', im2.size)
