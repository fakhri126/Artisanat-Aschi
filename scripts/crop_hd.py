from PIL import Image

im = Image.open(r"public\poignees\ceramique_in_situ_cuisine_complete.jpg")
w, h = im.size
print(f"cuisine complete size: {w}x{h}")

# The middle-right / bottom-right quadrant:
# Let's crop x from ~575 to w, y from ~270 to h
# Let's inspect where the dividing lines are:
# In the collage, vertical divider is around x=568 (since 1024 * 0.55 = 563)
# Horizontal divider for top-right is around y=268
# Bottom section right is from x=572 to 1024, y=273 to 682
crop_hd = im.crop((575, 275, 1024, 682))
crop_hd.save(r"public\images\poignees_cuisine_hd.jpg", quality=95)
print("Saved public/images/poignees_cuisine_hd.jpg")

# Also let's crop the 3 drawers from the bottom-left close-up or from the drawers:
# In crop_hd, the 3 drawers are on the left side:
# drawer top knob, middle knob, bottom knob
# Let's extract the top knob (mosaic) in high resolution from this crop!
# In im coordinates:
# top knob is around x=668, y=340
knob_mosaic_hd = im.crop((650, 320, 688, 358))
knob_mosaic_hd.save(r"public\poignees\knob_mosaic_hd.png")

# Also in the bottom-middle panel of im (x from ~288 to 568, y from ~450 to 682):
# There are 5 beautiful knobs on stone:
# 1. Top left: blue & yellow striped knob (around x=395, y=550)
# 2. Top right: yellow & blue diagonal striped knob (around x=460, y=550)
# 3. Bottom left: burgundy dotted knob (around x=330, y=595)
# 4. Bottom right: green olive knob (around x=515, y=595)
knob_blue_yellow_hd = im.crop((370, 525, 422, 577))
knob_blue_yellow_hd.save(r"public\poignees\knob_blue_yellow_hd.png")

knob_burgundy_hd = im.crop((300, 570, 360, 630))
knob_burgundy_hd.save(r"public\poignees\knob_burgundy_hd.png")

print("HD crops complete!")
