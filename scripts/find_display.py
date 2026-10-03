import os

matches = []
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js', '.json')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
                if 'poignees_display' in c:
                    matches.append(p)

print("Found in:", matches)
