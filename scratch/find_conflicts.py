import os

base_dir = r"C:/Users/AHMED BOUTABA/Downloads/Artisanat-Aschi-main/Artisanat-Aschi-main"

conflict_files = []
for root, dirs, files in os.walk(base_dir):
    if "node_modules" in root or ".next" in root or ".git" in root:
        continue
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.java', '.html', '.md')):
            fpath = os.path.join(root, f)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    if "<<<<<<<" in content:
                        conflict_files.append(fpath)
            except Exception as e:
                pass

print(f"Found {len(conflict_files)} files with conflict markers:")
for cf in conflict_files:
    print(" - ", cf)
