with open(r"components\site\projects.tsx", 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if "Villa d'exception" in line or "Conception intégrale" in line:
            print(f"projects.tsx:{i+1}: {line.strip()}")

with open(r"app\espaces-d-exception\page.tsx", 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if "Villa d'exception" in line or "Conception intégrale" in line:
            print(f"espaces-d-exception/page.tsx:{i+1}: {line.strip()}")
