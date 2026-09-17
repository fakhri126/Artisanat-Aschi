import re

files_to_check = [
    r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/components/site/catalog-page.tsx",
    r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/app/admin/catalogue/page.tsx",
    r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/app/admin/products/page.tsx",
]

for fpath in files_to_check:
    print("=" * 60)
    print("FILE:", fpath)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        if line.startswith("<<<<<<<") or line.startswith("=======") or line.startswith(">>>>>>>"):
            print(f"Line {idx}: {line.strip()}")
