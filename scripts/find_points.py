import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png"
img = Image.open(src_path).convert("RGBA")
w, h = img.size

# Let's inspect coordinates of:
# 1. Top of wood rim
# 2. Bottom of wood rim
# 3. Left of wood rim
# 4. Right of wood rim
# 5. The ceramic center and boundary

# Let's create a script that generates a grid of sampled points or extracts using polygon/ellipse mask
# By visually inspecting media_1790776356111.png (425x475):
# Wood rim outer edge:
# Topmost point of wood: around (200, 52)
# Rightmost point of wood: around (395, 275)
# Bottommost point of wood: around (225, 442)
# Leftmost point of wood: around (2, 230)
# Top-left wood edge: around (75, 120)
# Top-right wood edge: around (320, 115)
# Bottom-right wood edge: around (340, 390)
# Bottom-left wood edge: around (90, 400)

# Let's refine these points with color edge detection:
arr = np.array(img)

# Save a visualization image with marker points to confirm accuracy
vis = img.copy()
draw = ImageDraw.Draw(vis)

points = [
    (202, 52),   # top
    (260, 68),
    (320, 115),  # top-right
    (370, 190),
    (395, 275),  # right
    (380, 350),
    (335, 400),  # bottom-right
    (270, 435),
    (215, 442),  # bottom
    (145, 430),
    (80, 395),   # bottom-left
    (35, 335),
    (2, 235),    # left
    (15, 160),
    (65, 110),   # top-left
    (130, 72)
]

draw.polygon(points, outline=(255, 0, 0, 255), width=3)
vis.save(r"scripts\test_outline.png")
print("Saved test outline")
