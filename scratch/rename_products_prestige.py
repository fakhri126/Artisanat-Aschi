import urllib.request
import json

# 1. Login as Admin
login_data = json.dumps({
    "username": "admin",
    "password": "adminpassword"
}).encode('utf-8')

login_req = urllib.request.Request(
    'http://localhost:8081/api/auth/login',
    data=login_data,
    headers={'Content-Type': 'application/json'}
)

with urllib.request.urlopen(login_req) as resp:
    token = json.loads(resp.read().decode('utf-8')).get('token')
    print("[SUCCESS] Admin Logged in successfully!")

# 2. Get all products
req_p = urllib.request.Request('http://localhost:8081/api/public/products?type=CATALOGUE')
with urllib.request.urlopen(req_p) as resp:
    products = json.loads(resp.read().decode('utf-8'))

# Curated poetic names for each creation
name_mappings = {
    # --- BUFFETS BLANC PETIT ---
    289: ("Buffet Blanc Petit « Jasmin »", "Blanc Cérusé", "Petit", "Buffet artisanal 2 portes en bois blanc cérusé incrusté de motifs floraux traditionnels."),
    294: ("Buffet Blanc Petit « Sidi Bou »", "Blanc Cérusé", "Petit", "Buffet raffiné aux tonalités blanches douces et céramiques tunisiennes azurées."),
    295: ("Buffet Blanc Petit « Médina »", "Blanc Cérusé", "Petit", "Création compacte en bois massif blanc cérusé et faïences géométriques."),
    296: ("Buffet Blanc Petit « Andalous »", "Blanc Cérusé", "Petit", "Buffet artisanal d'inspiration hispano-mauresque aux finitions blanches délicates."),
    297: ("Buffet Blanc Petit « Dar El Jeld »", "Blanc Cérusé", "Petit", "Élégance intemporelle du blanc patiné et de la céramique d'artisan."),

    # --- BUFFETS BLANC MOYEN ---
    288: ("Buffet Blanc Moyen « Carthage »", "Blanc Cérusé", "Moyen", "Buffet 3 portes blanc cérusé orné de carreaux de faïence polychrome d'exception."),
    314: ("Buffet Blanc Moyen « Palais Bey »", "Blanc Cérusé", "Moyen", "Buffet sculpté en bois blanc noble aux incrustations de céramique royale."),
    315: ("Buffet Blanc Moyen « Riad Bleu »", "Blanc Cérusé", "Moyen", "Harmonie parfaite du blanc cérusé et des émaux bleus cobalt."),
    316: ("Buffet Blanc Moyen « Al-Diwan »", "Blanc Cérusé", "Moyen", "Pièce maîtresse aux finitions blanches raffinées et arabesques artisanales."),
    317: ("Buffet Blanc Moyen « Sahara Blanc »", "Blanc Cérusé", "Moyen", "Buffet lumineux alliant la pureté du blanc et la tradition potière tunisienne."),
    318: ("Buffet Blanc Moyen « Majolique »", "Blanc Cérusé", "Moyen", "Splendide buffet blanc serti de majoliques artisanales peintes à la main."),
    319: ("Buffet Blanc Moyen « Soltana »", "Blanc Cérusé", "Moyen", "Création d'exception aux lignes épurées et céramiques traditionnelles."),
    320: ("Buffet Blanc Moyen « Zellige Blanc »", "Blanc Cérusé", "Moyen", "Buffet 3 portes blanc cérusé orné de motifs zellige raffinés."),
    321: ("Buffet Blanc Moyen « El Hana »", "Blanc Cérusé", "Moyen", "Équilibre et sérénité du bois blanc cérusé sculpté sur-mesure."),
    322: ("Buffet Blanc Moyen « Ksar »", "Blanc Cérusé", "Moyen", "Buffet de caractère associant menuiserie artisanale et céramique d'art."),
    323: ("Buffet Blanc Moyen « Bizerte »", "Blanc Cérusé", "Moyen", "Inspiration méditerranéenne aux nuances blanches et émaux colorés."),

    # --- BUFFETS BLANC GRAND ---
    290: ("Buffet Blanc Grand « Dar Ennour »", "Blanc Cérusé", "Grand", "Grand buffet d'apparat 4 portes en bois massif blanc cérusé et faïences royales."),
    302: ("Buffet Blanc Grand « L'Impérial Blanc »", "Blanc Cérusé", "Grand", "Grande enfilade artisanale blanc cérusé aux motifs andalous d'exception."),

    # --- BUFFETS OR PETIT ---
    292: ("Buffet Or Petit « Soltane »", "Or", "Petit", "Buffet compact aux reflets dorés chauds et céramiques artisanales serties."),
    298: ("Buffet Or Petit « Soleil de Carthage »", "Or", "Petit", "Éclat chaleureux du bois doré et céramique artisanale peinte à la main."),
    299: ("Buffet Or Petit « Dune Dorée »", "Or", "Petit", "Nuances solaires et savoir-faire traditionnel pour ce meuble d'appoint d'exception."),
    300: ("Buffet Or Petit « Oasis »", "Or", "Petit", "Buffet doré 2 portes incrusté de faïences tunisiennes traditionnelles."),
    301: ("Buffet Or Petit « Émir »", "Or", "Petit", "Création prestige aux finitions or noble et céramiques polychromes."),

    # --- BUFFETS OR MOYEN ---
    291: ("Buffet Or Moyen « Kairouan »", "Or", "Moyen", "Buffet 3 portes aux dorures artisanales chaleureuses et médaillon central sculpté."),
    304: ("Buffet Or Moyen « Zellige Doré »", "Or", "Moyen", "Sublime buffet orné de céramiques colorées sur fond de bois doré texturé."),
    305: ("Buffet Or Moyen « L'Andalou Doré »", "Or", "Moyen", "Alliance de la menuiserie fine et des ornements dorés d'inspiration mauresque."),
    306: ("Buffet Or Moyen « Palais d'Or »", "Or", "Moyen", "Buffet de prestige en bois noble aux reflets d'or et émaux artisanaux."),
    307: ("Buffet Or Moyen « Rameaux d'Or »", "Or", "Moyen", "Sculptures délicates et motifs céramiques sur buffet moyen or."),
    308: ("Buffet Or Moyen « Medina d'Or »", "Or", "Moyen", "Buffet authentique 3 portes au cachet artisanal et patine dorée."),
    309: ("Buffet Or Moyen « Étoile du Sud »", "Or", "Moyen", "Création magistrale alliant chaleur du bois doré et faïences séculaires."),
    310: ("Buffet Or Moyen « Amber »", "Or", "Moyen", "Teintes chaudes ambrées et dorées sublimées par la céramique tunisienne."),
    311: ("Buffet Or Moyen « Al-Mansour »", "Or", "Moyen", "Buffet d'inspiration royale aux finitions or et bois massif sculpté."),
    312: ("Buffet Or Moyen « Mirage »", "Or", "Moyen", "Élégance solaire et détails artisanaux d'une finesse remarquable."),
    313: ("Buffet Or Moyen « Caravane »", "Or", "Moyen", "Pièce de caractère aux tonalités dorées et céramiques d'artisan."),

    # --- BUFFETS OR GRAND ---
    293: ("Buffet Or Grand « Soltane Royal »", "Or", "Grand", "Grande enfilade d'apparat 4 portes aux reflets dorés et somptueuses faïences."),
    303: ("Buffet Or Grand « Grand Palais d'Or »", "Or", "Grand", "Grand buffet magistral doré sculpté à la main pour les intérieurs de prestige."),
}

for pid, (new_name, new_color, new_dim, new_desc) in name_mappings.items():
    p = next((x for x in products if x.get('id') == pid), None)
    if not p:
        continue
    
    cat_id = p.get('category', {}).get('id')
    imgs = p.get('images', [])
    
    payload = {
        "name": new_name,
        "description": new_desc,
        "categoryId": cat_id,
        "dimensions": new_dim,
        "materials": "Bois massif noble & Céramique artisanale",
        "color": new_color,
        "price": p.get('price'),
        "availability": "Sur commande (sur-mesure)",
        "type": "CATALOGUE",
        "isFeatured": True,
        "imageVariants": [{"imageUrl": img.get('imageUrl'), "colorLabel": "Original"} for img in imgs]
    }
    
    up_req = urllib.request.Request(
        f'http://localhost:8081/api/admin/products/{pid}',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='PUT'
    )
    try:
        with urllib.request.urlopen(up_req) as up_res:
            print(f"[OK] Renamed {pid} -> '{new_name}' ({new_color} / {new_dim})")
    except Exception as ex:
        print(f"[ERROR] {pid}:", ex)

print("\n[SUCCESS] All products have been given professional prestige names!")
