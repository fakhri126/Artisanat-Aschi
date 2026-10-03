from PIL import Image
import os

# Let's crop the beautiful knobs from the high-res sources:
# 1. Striped knob from media_1790522181820.png (Right panel, left knob)
# Let's upscale and enhance it with a clean round mask and natural wooden frame:
img_src = Image.open(r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790522181820.png")
# Right panel:
# Let's crop the blue striped knob with precise center:
# Knob center in 618x202 is around (485, 106) with radius ~32
from PIL import ImageEnhance, ImageFilter

crop1 = img_src.crop((453, 73, 521, 141)) # 68x68
crop1 = crop1.resize((256, 256), Image.Resampling.LANCZOS)
# sharpen slightly
crop1 = crop1.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))

from PIL import ImageDraw
mask = Image.new('L', (256, 256), 0)
d = ImageDraw.Draw(mask)
d.ellipse((6, 6, 250, 250), fill=255)
res1 = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
res1.paste(crop1, (0, 0), mask)
res1.save(r"public\poignees\knob_striped_premium.png")

# 2. Green eye knob from Left panel (left knob):
# Center is around (43, 103) with radius ~32
crop2 = img_src.crop((11, 71, 79, 139))
crop2 = crop2.resize((256, 256), Image.Resampling.LANCZOS)
crop2 = crop2.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
res2 = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
res2.paste(crop2, (0, 0), mask)
res2.save(r"public\poignees\knob_green_eye_premium.png")

# 3. Mosaic knob from kitchen complete (high res!):
im_cuisine = Image.open(r"public\poignees\ceramique_in_situ_cuisine_complete.jpg")
# Top drawer knob in cuisine complete is at (669, 340) in 1024x682!
# Let's crop radius 24 -> 48x48
crop3 = im_cuisine.crop((648, 319, 690, 361))
crop3 = crop3.resize((256, 256), Image.Resampling.LANCZOS)
crop3 = crop3.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
res3 = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
res3.paste(crop3, (0, 0), mask)
res3.save(r"public\poignees\knob_mosaic_premium.png")

# 4. From placad bois (blue grid & burgundy floral, 768x1024):
im_placard = Image.open(r"public\poignees\ceramique_in_situ_placard_bois.jpg")
# Left knob center is around x=304, y=536, radius ~115!
crop4 = im_placard.crop((189, 421, 419, 651))
crop4 = crop4.resize((256, 256), Image.Resampling.LANCZOS)
res4 = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
res4.paste(crop4, (0, 0), mask)
res4.save(r"public\poignees\knob_placard_grid_premium.png")

print("Premium knobs generated!")
