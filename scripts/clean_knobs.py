from PIL import Image, ImageDraw, ImageFilter

# Let's crop from media_1790522181820.png with high precision:
img = Image.open(r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790522181820.png")
w, h = img.size

# In 618x202:
# The blue striped knob center is around x=486, y=107, radius=31
cx, cy, r = 486, 107, 31
crop = img.crop((cx - r, cy - r, cx + r, cy + r))
size = (256, 256)
crop_up = crop.resize(size, Image.Resampling.LANCZOS)
crop_up = crop_up.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2))

# Smooth anti-aliased circular mask
mask_hi = Image.new('L', (512, 512), 0)
draw_hi = ImageDraw.Draw(mask_hi)
draw_hi.ellipse((10, 10, 502, 502), fill=255)
mask = mask_hi.resize(size, Image.Resampling.LANCZOS)

res = Image.new('RGBA', size, (0, 0, 0, 0))
res.paste(crop_up, (0, 0), mask)
res.save(r"public\poignees\knob_striped_clean.png")

# Also for green eye knob (Photo 1 left):
# cx=44, cy=105, r=32
cx2, cy2, r2 = 44, 105, 32
crop2 = img.crop((cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2))
crop2_up = crop2.resize(size, Image.Resampling.LANCZOS)
crop2_up = crop2_up.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2))
res2 = Image.new('RGBA', size, (0, 0, 0, 0))
res2.paste(crop2_up, (0, 0), mask)
res2.save(r"public\poignees\knob_green_eye_clean.png")

print("Clean knobs created successfully!")
