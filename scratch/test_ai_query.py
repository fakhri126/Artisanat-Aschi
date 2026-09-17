import json

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

# Test with query
queries = [
    "moyen blanc buffets",
    "buffets blanc moyen",
    "buffet blanc petit",
    "blanc",
    "moyen"
]

for q in queries:
    stopWords = ['je', 'cherche', 'voudrais', 'veux', 'veut', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'en', 'avec', 'pour', 'et', 'ou', 'est', 'que', 'qui', 'dans', 'sur']
    keywords = [w for w in q.lower().split() if len(w) > 2 and w not in stopWords]
    searchTerms = keywords if len(keywords) > 0 else [q.lower()]
    
    print(f"\n--- Query: '{q}', Search terms: {searchTerms} ---")
    
    # Current catalog-page.tsx logic:
    perfectMatches = [p for p in products if all(
        isFuzzyMatch(term, p.get('name')) or
        isFuzzyMatch(term, p.get('description')) or
        isFuzzyMatch(term, p.get('category', {}).get('name')) or
        isFuzzyMatch(term, p.get('color')) or
        isFuzzyMatch(term, p.get('dimensions')) or
        any(isFuzzyMatch(term, img.get('colorLabel')) for img in p.get('images', []))
        for term in searchTerms
    )]
    
    print("Perfect matches:", [p['name'] for p in perfectMatches])
    
    colorWords = ['blanc', 'blanche', 'or', 'doré', 'dore', 'bleu', 'bleue', 'noyer', 'naturel', 'vert', 'verte', 'bordeaux', 'rose', 'gris', 'grise', 'noir', 'noire', 'rouge']
    typedColor = next((term for term in searchTerms if term in colorWords), None)
    
    def matchesPartial(p):
        if typedColor:
            matchesColor = isFuzzyMatch(typedColor, p.get('color')) or any(isFuzzyMatch(typedColor, img.get('colorLabel')) for img in p.get('images', []))
            if not matchesColor: return False
        return any(
            isFuzzyMatch(term, p.get('name')) or
            isFuzzyMatch(term, p.get('description')) or
            isFuzzyMatch(term, p.get('category', {}).get('name')) or
            isFuzzyMatch(term, p.get('color')) or
            isFuzzyMatch(term, p.get('dimensions')) or
            any(isFuzzyMatch(term, img.get('colorLabel')) for img in p.get('images', []))
            for term in searchTerms
        )
        
    partialMatches = [p for p in products if matchesPartial(p)]
    print("Partial matches:", [p['name'] for p in partialMatches])
