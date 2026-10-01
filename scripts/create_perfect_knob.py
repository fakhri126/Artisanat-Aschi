from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Load base rotated image
rot = Image.open("scripts/rot_base.png").convert("RGBA")
rw, rh = rot.size

# Let's inspect the ceramic boundary in the rotated image:
# Center is around (324, 322)
# Radius X (horizontal): ~ 172
# Radius Y (vertical): ~ 138

# Test ceramic crop:
# Let's test cropping with an ellipse
cx, cy = 324, 322
rx, ry = 172, 138

crop_ceramic = rot.crop((cx - rx, cy - ry, cx + rx, cy + ry))
# Now resize to a square circle (512x512)
ceramic_512 = crop_ceramic.resize((512, 512), Image.Resampling.LANCZOS)

# Anti-aliased circle mask
mask_1024 = Image.new('L', (1024, 1024), 0)
d = ImageDraw.Draw(mask_1024)
d.ellipse((16, 16, 1008, 1008), fill=255)
mask_1024 = mask_1024.filter(ImageFilter.GaussianBlur(radius=5))
mask_512 = mask_1024.resize((512, 512), Image.Resampling.LANCZOS)

ceramic_final = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
ceramic_final.paste(ceramic_512, (0, 0), mask_512)

# Slight color pop & clarity enhancement
enhancer = ImageEnhance.Color(ceramic_final)
# enhance color slightly to keep rich hand-painted vibrant colors
ceramic_final = enhancer.enhance(1.08)

ceramic_final.save(r"public\poignees\knob_user_new.png")
print("Saved public\\poignees\\knob_user_new.png")

# Also let's do the FULL KNOB (with the authentic wooden rim from the user's photo):
# In rot, the wood rim extends beyond the ceramic:
# Wood rx ~ 205, ry ~ 168, center around (324, 322)
rx_w, ry_w = 202, 164
crop_wood = rot.crop((cx - rx_w, cy - ry_w, cx + rx_w, cy + ry_w))
wood_512 = crop_wood.resize((512, 512), Image.Resampling.LANCZOS)

wood_final = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
wood_final.paste(wood_512, (0, 0), mask_512)
wood_final.save(r"public\poignees\knob_user_new_full.png")
print("Saved public\\poignees\\knob_user_new_full.png")
