import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png"
img = Image.open(src_path).convert("RGBA")
w, h = img.size

# 1. CERAMIC DISK EXTRACTION
# Let's define the spline/smooth polygon for the ceramic boundary:
# Based on visual verification from test_outline:
ceramic_points = [
    (202, 115),  # top
    (240, 125),
    (280, 145),
    (320, 175),  # top-right
    (355, 215),
    (380, 260),  # right
    (385, 280),
    (370, 330),
    (345, 365),  # bottom-right
    (305, 395),
    (255, 412),
    (215, 414),  # bottom
    (170, 405),
    (125, 385),  # bottom-left
    (85, 350),
    (55, 305),
    (38, 255),   # left
    (48, 205),
    (75, 165),   # top-left
    (115, 138),
    (160, 120)
]

# We can crop the bounding box of the ceramic:
# x: 38 to 385 (width = 347)
# y: 115 to 414 (height = 299)
# Center of ceramic is roughly ((38+385)/2, (115+414)/2) = (211.5, 264.5)

# High-resolution super-sampled mask
scale = 4
mask_hi = Image.new('L', (w * scale, h * scale), 0)
draw_hi = ImageDraw.Draw(mask_hi)
scaled_points = [(p[0] * scale, p[1] * scale) for p in ceramic_points]
draw_hi.polygon(scaled_points, fill=255)
# Smooth mask with slight blur for perfect anti-aliasing
mask_hi = mask_hi.filter(ImageFilter.GaussianBlur(radius=scale * 1.2))

mask = mask_hi.resize((w, h), Image.Resampling.LANCZOS)

# Create isolated ceramic RGBA
ceramic_isolated = Image.new('RGBA', (w, h), (0, 0, 0, 0))
ceramic_isolated.paste(img, (0, 0), mask)

# Now crop ceramic bounding box:
bbox = (35, 110, 390, 420)
ceramic_crop = ceramic_isolated.crop(bbox)

# The ceramic in the photo is viewed at an angle (width 355, height 310).
# Let's square it into a round 512x512 icon:
target_size = (512, 512)
ceramic_square = ceramic_crop.resize(target_size, Image.Resampling.LANCZOS)

# Apply a clean circular mask on the 512x512 result:
circle_mask = Image.new('L', (1024, 1024), 0)
circle_draw = ImageDraw.Draw(circle_mask)
circle_draw.ellipse((20, 20, 1004, 1004), fill=255)
circle_mask = circle_mask.filter(ImageFilter.GaussianBlur(radius=4))
circle_mask = circle_mask.resize(target_size, Image.Resampling.LANCZOS)

final_ceramic = Image.new('RGBA', target_size, (0, 0, 0, 0))
final_ceramic.paste(ceramic_square, (0, 0), circle_mask)

# Save the ceramic disk
final_ceramic.save(r"public\poignees\knob_user_new.png")
print("Saved public\\poignees\\knob_user_new.png")

# 2. FULL KNOB EXTRACTION (Wood rim + Ceramic)
# Let's define the outer wood points:
wood_points = [
    (202, 50),
    (245, 58),
    (290, 78),
    (335, 110),
    (375, 160),
    (402, 220),
    (410, 275),  # far right edge of wood
    (395, 340),
    (365, 385),
    (320, 422),
    (265, 442),
    (210, 444),  # bottom edge of wood
    (150, 432),
    (95, 405),
    (55, 360),
    (25, 305),
    (5, 235),    # left edge of wood
    (15, 165),
    (45, 115),
    (95, 78),
    (150, 58)
]

mask_wood_hi = Image.new('L', (w * scale, h * scale), 0)
draw_wood_hi = ImageDraw.Draw(mask_wood_hi)
scaled_wood = [(p[0] * scale, p[1] * scale) for p in wood_points]
draw_wood_hi.polygon(scaled_wood, fill=255)
mask_wood_hi = mask_wood_hi.filter(ImageFilter.GaussianBlur(radius=scale * 1.5))
mask_wood = mask_wood_hi.resize((w, h), Image.Resampling.LANCZOS)

wood_isolated = Image.new('RGBA', (w, h), (0, 0, 0, 0))
wood_isolated.paste(img, (0, 0), mask_wood)

# Crop wood bounding box: (0, 45, 415, 450)
wood_crop = wood_isolated.crop((2, 45, 415, 448))
wood_square = wood_crop.resize(target_size, Image.Resampling.LANCZOS)

# Circularized mask for smooth 360 rotation:
final_wood = Image.new('RGBA', target_size, (0, 0, 0, 0))
final_wood.paste(wood_square, (0, 0), circle_mask)

final_wood.save(r"public\poignees\knob_user_new_full.png")
print("Saved public\\poignees\\knob_user_new_full.png")
