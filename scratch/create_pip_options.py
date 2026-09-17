import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

f_face = r'backend\uploads\519f1bb0-c027-4ccf-afbd-d7dc21f020fa.jpg'
f_top = r'backend\uploads\e30b3bc5-8eab-4bea-9885-457c5542bf0b.jpg'

im_face = Image.open(f_face).convert('RGB')
im_top = Image.open(f_top).convert('RGB')

w_face, h_face = im_face.size
w_top, h_top = im_top.size

# Beautiful diagonal crop of the ceramic tiles on top
crop_top = im_top.crop((int(w_top * 0.05), int(h_top * 0.05), int(w_top * 0.95), int(h_top * 0.85)))

inset_w = int(w_face * 0.35)
inset_h = int(inset_w * 0.72)

inset_img = crop_top.resize((inset_w, inset_h), Image.Resampling.LANCZOS)

def create_rounded_mask(size, radius):
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius, fill=255)
    return mask

radius = 28
inset_mask = create_rounded_mask((inset_w, inset_h), radius)

shadow_pad = 30
shadow_size = (inset_w + shadow_pad * 2, inset_h + shadow_pad * 2)
shadow_img = Image.new('RGBA', shadow_size, (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow_img)
shadow_draw.rounded_rectangle((shadow_pad, shadow_pad + 10, shadow_pad + inset_w, shadow_pad + inset_h + 10), radius, fill=(0, 0, 0, 160))
shadow_blurred = shadow_img.filter(ImageFilter.GaussianBlur(16))

def build_composite(pos_x, pos_y, out_name):
    composite = im_face.copy().convert('RGBA')
    composite.paste(shadow_blurred, (pos_x - shadow_pad, pos_y - shadow_pad), shadow_blurred)
    composite.paste(inset_img, (pos_x, pos_y), inset_mask)
    
    draw_comp = ImageDraw.Draw(composite)
    # Double Luxury Gold Border
    draw_comp.rounded_rectangle((pos_x, pos_y, pos_x + inset_w, pos_y + inset_h), radius, outline=(218, 165, 32, 255), width=5)
    draw_comp.rounded_rectangle((pos_x + 3, pos_y + 3, pos_x + inset_w - 3, pos_y + inset_h - 3), radius - 3, outline=(255, 245, 220, 200), width=2)
    
    # Elegant Badge
    badge_h = 44
    badge_w = int(inset_w * 0.72)
    badge_x = pos_x + (inset_w - badge_w) // 2
    badge_y = pos_y + inset_h - badge_h - 14
    
    badge_mask = create_rounded_mask((badge_w, badge_h), 14)
    badge_bg = Image.new('RGBA', (badge_w, badge_h), (35, 22, 14, 235))
    composite.paste(badge_bg, (badge_x, badge_y), badge_mask)
    draw_comp.rounded_rectangle((badge_x, badge_y, badge_x + badge_w, badge_y + badge_h), 14, outline=(218, 165, 32, 230), width=2)
    
    try:
        font = ImageFont.truetype("arialbd.ttf", 22)
    except:
        font = ImageFont.load_default()
        
    text = "DÉTAIL DU PLATEAU"
    bbox = draw_comp.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = badge_x + (badge_w - tw) // 2
    ty = badge_y + (badge_h - th) // 2 - 2
    draw_comp.text((tx, ty), text, fill=(255, 235, 175, 255), font=font)
    
    final_rgb = composite.convert('RGB')
    
    art_path = rf'C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\3c8c1131-1dcb-4525-9972-6ce1774496c6\{out_name}'
    pub_path = rf'public\{out_name}'
    upload_path = rf'backend\uploads\{out_name}'
    
    final_rgb.save(art_path, quality=98)
    final_rgb.save(pub_path, quality=98)
    final_rgb.save(upload_path, quality=98)
    print(f'Saved {out_name}!')

# 1. Top Right
build_composite(w_face - inset_w - 70, 70, 'buffet_or_moyen_detail_plateau_hd.jpg')

# 2. Top Left
build_composite(70, 70, 'buffet_or_moyen_detail_plateau_gauche_hd.jpg')
