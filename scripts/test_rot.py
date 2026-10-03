import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png"
img = Image.open(src_path).convert("RGBA")
w, h = img.size

# The knob's tilted angle:
# The major axis runs from bottom-left (around 60, 370) to top-right (around 350, 140)
# Angle: dy = 140 - 370 = -230, dx = 350 - 60 = 290
# angle_rad = atan2(-230, 290) = -38.4 degrees (approx -35 to -40 deg)
# If we rotate by +38 deg, the knob's major axis becomes horizontal!

for rot in [30, 35, 38, 42]:
    rot_img = img.rotate(rot, expand=True, resample=Image.Resampling.BICUBIC)
    rot_img.save(f"scripts/test_rot_{rot}.png")

print("Generated rotation tests")
