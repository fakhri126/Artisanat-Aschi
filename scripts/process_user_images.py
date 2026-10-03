from PIL import Image, ImageDraw
import os

img_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790522181820.png"
img = Image.open(img_path)
w, h = img.size
print(f"Original size: {w}x{h}, mode: {img.mode}")

# Convert to RGB for JPEG or keep RGBA for PNG
rgb_img = img.convert('RGB')

# Let's save the middle photo ("la deuxieme" - kitchen drawers)
# Panel 1 (left): 0 to 205
# Panel 2 (middle): 205 to 425 (approx 0.33 to 0.68)
# Panel 3 (right): 425 to 618
crop_middle = rgb_img.crop((int(w * 0.332), 0, int(w * 0.686), h))
os.makedirs(r"public\images", exist_ok=True)
crop_middle.save(r"public\images\poignees_cuisine_hero.jpg", quality=95)
crop_middle.save(r"public\images\poignees_cuisine_hero.png")
print("Saved public/images/poignees_cuisine_hero.jpg & png")

# Now let's extract the knobs from Image 1:
# Let's extract:
# 1. Knob from Right panel (blue stripes):
# Coordinates in 618x202:
# x is around 450 to 520, y is around 70 to 140
knob_striped = img.crop((450, 70, 520, 140))
knob_striped.save(r"public\poignees\knob_striped.png")

# 2. Knob from Left panel (green eye):
# x is around 8 to 78, y is around 68 to 138
knob_green_eye = img.crop((8, 68, 78, 138))
knob_green_eye.save(r"public\poignees\knob_green_eye.png")

# 3. Knob from Left panel (blue swirl):
# x is around 94 to 170, y is around 68 to 140
knob_blue_swirl = img.crop((94, 68, 170, 140))
knob_blue_swirl.save(r"public\poignees\knob_blue_swirl.png")

# 4. Top knob from Middle panel (mosaic):
# x is around 250 to 275, y is around 42 to 68
knob_mosaic = img.crop((248, 40, 278, 70))
knob_mosaic.save(r"public\poignees\knob_mosaic.png")

# Also let's create circular masked versions with soft edge
def make_circular(im, outfile, size=(128, 128)):
    # resize with high quality
    im_resized = im.resize(size, Image.Resampling.LANCZOS)
    # create circle mask
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((2, 2, size[0] - 2, size[1] - 2), fill=255)
    result = Image.new('RGBA', size, (0, 0, 0, 0))
    result.paste(im_resized, (0, 0), mask)
    result.save(outfile, "PNG")

make_circular(knob_striped, r"public\poignees\knob_striped_circle.png")
make_circular(knob_green_eye, r"public\poignees\knob_green_eye_circle.png")
make_circular(knob_blue_swirl, r"public\poignees\knob_blue_swirl_circle.png")
make_circular(knob_mosaic, r"public\poignees\knob_mosaic_circle.png")

print("All knobs processed and saved successfully!")
