import shutil
import os

base_public = r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/public"

# Copy placeholder.jpg to placeholder.png
src_jpg = os.path.join(base_public, "placeholder.jpg")
dest_png = os.path.join(base_public, "placeholder.png")

if os.path.exists(src_jpg):
    shutil.copyfile(src_jpg, dest_png)
    print("Copied placeholder.jpg -> placeholder.png")
else:
    # If not found, copy placeholder.svg or create an empty fallback
    print("placeholder.jpg not found, searching...")

# Verify
if os.path.exists(dest_png):
    print("placeholder.png is now present in public directory!")
