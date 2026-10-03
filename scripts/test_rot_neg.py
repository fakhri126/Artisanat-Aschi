from PIL import Image

src_path = r"C:\Users\AHMED BOUTABA\.gemini\antigravity\brain\d51e4cb6-e01e-4d97-a965-a46d8c867570\.user_uploaded\media_1790776356111.png"
img = Image.open(src_path).convert("RGBA")

for rot in [-45, -42, -40]:
    rot_img = img.rotate(rot, expand=True, resample=Image.Resampling.BICUBIC)
    rot_img.save(f"scripts/test_rot_{rot}.png")

print("Generated negative rotation tests")
