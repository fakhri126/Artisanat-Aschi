import shutil
import os

source_images = [
    (r"C:/Users/AHMED BOUTABA/.gemini/antigravity/brain/3c8c1131-1dcb-4525-9972-6ce1774496c6/.user_uploaded/media_1787739396069.jpg", "lustre-carre-bois-sculpte-laiton.jpg"),
    (r"C:/Users/AHMED BOUTABA/.gemini/antigravity/brain/3c8c1131-1dcb-4525-9972-6ce1774496c6/.user_uploaded/media_1787739396114.jpg", "lustre-carre-vert-chechia.jpg"),
    (r"C:/Users/AHMED BOUTABA/.gemini/antigravity/brain/3c8c1131-1dcb-4525-9972-6ce1774496c6/.user_uploaded/media_1787739396211.jpg", "lustre-rectangulaire-salle-manger-1.jpg"),
    (r"C:/Users/AHMED BOUTABA/.gemini/antigravity/brain/3c8c1131-1dcb-4525-9972-6ce1774496c6/.user_uploaded/media_1787739396231.jpg", "lustre-rectangulaire-salle-manger-2.jpg"),
    (r"C:/Users/AHMED BOUTABA/.gemini/antigravity/brain/3c8c1131-1dcb-4525-9972-6ce1774496c6/.user_uploaded/media_1787739396273.jpg", "lustre-carre-vintage-edison.jpg"),
]

dest_dir = r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/public/uploads"
os.makedirs(dest_dir, exist_ok=True)

for src, name in source_images:
    dest = os.path.join(dest_dir, name)
    shutil.copyfile(src, dest)
    print(f"Copied {src} -> {dest}")

print("All 5 images copied successfully to public/uploads!")
