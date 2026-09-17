import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

f_face = r'backend\uploads\519f1bb0-c027-4ccf-afbd-d7dc21f020fa.jpg'
f_top = r'backend\uploads\e30b3bc5-8eab-4bea-9885-457c5542bf0b.jpg'

im_face = Image.open(f_face).convert('RGB')
im_top = Image.open(f_top).convert('RGB')

w_face, h_face = im_face.size
w_top, h_top = im_top.size

print('Face:', w_face, h_face)
print('Top:', w_top, h_top)

# We want an elegant inset in the top right or top left
# In the face photo, the wall has frames in the center-top.
# Let's crop a beautiful detail of the ceramic plateau on top
# Let's see im_top crop
crop_top = im_top.crop((0, int(h_top * 0.1), w_top, int(h_top * 0.9)))

# Let's create an inset box with width ~ 32% of face width
inset_w = int(w_face * 0.36)
inset_h = int(inset_w * 0.85)

inset_img = crop_top.resize((inset_w, inset_h), Image.Resampling.LANCZOS)

# Create a rounded corner mask for inset
def create_rounded_mask(size, radius):
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius, fill=255)
    return mask

radius = 24
inset_mask = create_rounded_mask((inset_w, inset_h), radius)

# Create shadow
shadow_pad = 20
shadow_size = (inset_w + shadow_pad * 2, inset_h + shadow_pad * 2)
shadow_img = Image.new('RGBA', shadow_size, (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow_img)
shadow_draw.rounded_rectangle((shadow_pad, shadow_pad + 8, shadow_pad + inset_w, shadow_pad + inset_h + 8), radius, fill=(0, 0, 0, 140))
shadow_blurred = shadow_img.filter(ImageFilter.GaussianBlur(12))

# Position inset: Top Right (e.g. x = w_face - inset_w - 30, y = 30)
# Or Top Left
pos_x = w_face - inset_w - 35
pos_y = 35

# Composite
composite = im_face.copy().convert('RGBA')

# Paste shadow
composite.paste(shadow_blurred, (pos_x - shadow_pad, pos_y - shadow_pad), shadow_blurred)

# Paste inset with mask
composite.paste(inset_img, (pos_x, pos_y), inset_mask)

# Draw gold/bronze luxury border & badge
draw_comp = ImageDraw.Draw(composite)
# Border
draw_comp.rounded_rectangle((pos_x, pos_y, pos_x + inset_w, pos_y + inset_h), radius, outline=(218, 165, 32, 240), width=4)
draw_comp.rounded_rectangle((pos_x+2, pos_y+2, pos_x + inset_w-2, pos_y + inset_h-2), radius-2, outline=(255, 255, 255, 180), width=2)

# Small elegant badge on bottom or top of inset
badge_h = 32
badge_w = int(inset_w * 0.75)
badge_x = pos_x + (inset_w - badge_w) // 2
badge_y = pos_y + inset_h - badge_h - 10

badge_mask = create_rounded_mask((badge_w, badge_h), 12)
badge_bg = Image.new('RGBA', (badge_w, badge_h), (44, 30, 22, 220))
composite.paste(badge_bg, (badge_x, badge_y), badge_mask)

draw_comp.rounded_rectangle((badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), 12, outline=(218, 165, 32, 220), width=2)

# Add text
try:
    font = ImageFont.truetype("arialbd.ttf", 16)
except:
    font = ImageFont.load_default()

text = "Détail Plateau"
bbox = draw_comp.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = badge_x + (badge_w - tw) // 2
ty = badge_y + (badge_h - th) // 2 - 2
draw_comp.text((tx, ty), text, fill=(255, 240, 200, 255), font=font)

# Save result
final_rgb = composite.convert('RGB')

out_art = r'C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\3c8c1131-1dcb-4525-9972-6ce1774496c6\buffet_or_moyen_avec_detail_plateau.jpg'
out_pub = r'public\buffet_or_moyen_avec_detail_plateau.jpg'
out_upload = r'backend\uploads\buffet_or_moyen_avec_detail_plateau.jpg'

final_rgb.save(out_art, quality=98)
final_rgb.save(out_pub, quality=98)
final_rgb.save(out_upload, quality=98)

print('Composite image successfully saved!')
