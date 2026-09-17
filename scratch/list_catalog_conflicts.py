fpath = r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main/components/site/catalog-page.tsx"
with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if line.startswith("<<<<<<<") or line.startswith("=======") or line.startswith(">>>>>>>"):
        print(f"Line {idx}: {line.strip()}")
