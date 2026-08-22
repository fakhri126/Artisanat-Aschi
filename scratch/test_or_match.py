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
    words = [w.strip(".,;:!?()[]{}\"'`") for w in t.split()]
    
    # Short terms (<= 3 chars, e.g. "or", "tv", "bois") MUST match whole words
    if len(term) <= 3:
        return term in words or term == t
    
    if term in t:
        return True
        
    if len(term) >= 4:
        maxTypos = 2 if len(term) >= 6 else 1
        return any(levenshtein(term, w) <= maxTypos for w in words)
    return False

# Test
p_blanc = {'name': 'Buffets Moyen Blanc', 'desc': 'Buffet artisanal avec portes en bois', 'color': 'Blanc Cérusé', 'dim': 'Moyen'}
p_or = {'name': 'Buffets Or Moyen', 'desc': 'Buffet artisanal avec portes en bois doré', 'color': 'Or', 'dim': 'Moyen'}

query = 'buffets or moyen'
terms = query.split()

def matches(p, terms):
    return all(
        isFuzzyMatch(t, p['name']) or
        isFuzzyMatch(t, p['desc']) or
        isFuzzyMatch(t, p['color']) or
        isFuzzyMatch(t, p['dim'])
        for t in terms
    )

print('p_blanc matches "buffets or moyen":', matches(p_blanc, terms))
print('p_or matches "buffets or moyen":', matches(p_or, terms))
