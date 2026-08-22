import json

# Product list
products = [
    {
        "id": 292,
        "name": "Buffets Or Petit",
        "category": {"name": "Buffets"},
        "color": "Or",
        "dimensions": "Petit",
        "images": [{"id": 563, "colorLabel": "Original"}, {"id": 564, "colorLabel": None}]
    },
    {
        "id": 289,
        "name": "Buffets Blanc  Petit",
        "category": {"name": "Buffets"},
        "color": "Blanc Cérusé",
        "dimensions": "Petit",
        "images": [{"id": 523, "colorLabel": "Original"}]
    },
    {
        "id": 290,
        "name": "Buffets Blanc Grand",
        "category": {"name": "Buffets"},
        "color": "Blanc Cérusé",
        "dimensions": "Grand",
        "images": [{"id": 530, "colorLabel": "Original"}]
    },
    {
        "id": 291,
        "name": "Buffets Or Moyen",
        "category": {"name": "Buffets"},
        "color": "Or",
        "dimensions": "Moyen",
        "images": [{"id": 532, "colorLabel": "Original"}]
    },
    {
        "id": 288,
        "name": "Buffets  Moyen Blanc",
        "category": {"name": "Buffets"},
        "color": "Blanc Cérusé",
        "dimensions": "Moyen",
        "images": [{"id": 540, "colorLabel": "Original"}]
    }
]

def levenshtein(a, b):
    if len(a) == 0: return len(b)
    if len(b) == 0: return len(a)
    matrix = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1): matrix[i][0] = i
    for j in range(len(b) + 1): matrix[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            matrix[i][j] = min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    return matrix[len(a)][len(b)]

def isFuzzyMatch(term, target):
    if not target: return False
    t = target.lower()
    if term in t: return True
    if len(term) >= 4:
        words = t.replace(',', ' ').replace('.', ' ').replace('-', ' ').split()
        maxTypos = 2 if len(term) >= 6 else 1
        return any(levenshtein(term, w) <= maxTypos for w in words)
    return False

def matchColorFlexible(target, itemColor):
    if not itemColor or not target: return False
    t = target.strip().lower()
    c = itemColor.strip().lower()
    if t in c or c in t: return True
    if isFuzzyMatch(t, c): return True
    if ('blanc' in t or 'white' in t) and ('blanc' in c or 'white' in c): return True
    if ('or' in t or 'doré' in t or 'gold' in t) and ('or' in c or 'doré' in c or 'gold' in c): return True
    return False

# Test Filter: category = "Buffets", color = "Blanc", dimension = "Moyen (80–150 cm)"
category = "Buffets"
color = "Blanc"
dimension = "Moyen (80–150 cm)"

filtered = products
if category != 'Tout':
    filtered = [p for p in filtered if p.get('category', {}).get('name', '').lower() == category.lower()]

print("After Category:", [p['name'] for p in filtered])

if color != 'Tout':
    targetColor = color.strip().lower()
    filtered = [p for p in filtered if matchColorFlexible(targetColor, p.get('color')) or any(matchColorFlexible(targetColor, img.get('colorLabel')) for img in p.get('images', []))]

print("After Color:", [p['name'] for p in filtered])

if dimension != 'Tout':
    targetDim = dimension.lower()
    def matchDim(p):
        dimStr = (p.get('dimensions') or '').lower()
        if 'petit' in targetDim and 'petit' in dimStr: return True
        if 'moyen' in targetDim and 'moyen' in dimStr: return True
        if 'grand' in targetDim and 'grand' in dimStr: return True
        return False
    filtered = [p for p in filtered if matchDim(p)]

print("After Dimension:", [p['name'] for p in filtered])
