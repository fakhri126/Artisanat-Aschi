import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png"
img = Image.open(src_path).convert("RGBA")

# Rotate by -42 degrees
rot = img.rotate(-42, expand=True, resample=Image.Resampling.BICUBIC)
rw, rh = rot.size

# In this rotated image, let's locate the knob's bounding box:
# Center is around (rw // 2, rh // 2)
cx, cy = rw // 2, rh // 2

# Let's save crops around (cx, cy) to find the exact bounding box
rot.save("scripts/rot_base.png")

# Ceramic disk in rot_base:
# Major axis (horizontal): radius_x ~ 170
# Minor axis (vertical): radius_y ~ 135
# Center is near (cx, cy)
print(f"Rotated size: {rw}x{rh}, center: ({cx}, {cy})")
