import os

search_phrase = "Villa d'exception"
search_phrase_2 = "Conception intégrale"

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js', '.json')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
                if search_phrase in c or search_phrase_2 in c or "espaces-d-exception" in p or "cle en main" in c.lower() or "clés en main" in c.lower():
                    if search_phrase in c or search_phrase_2 in c:
                        print("Exact match in:", p)
                    else:
                        print("Keyword in:", p)
