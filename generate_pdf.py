# -*- coding: utf-8 -*-
"""
Pure Python PDF Generator for Artisanat Aschi Hosting Guide
No external dependencies required.
"""
import os
import sys

def create_pdf(filename="Guide_Hebergement_Artisanat_Aschi.pdf"):
    # PDF generation helper
    class SimplePDF:
        def __init__(self):
            self.pages = []
            self.current_stream = []
            
        def new_page(self):
            if self.current_stream:
                self.pages.append("".join(self.current_stream))
                self.current_stream = []
                
        def add_stream(self, text):
            self.current_stream.append(text)
            
        def finish(self):
            if self.current_stream:
                self.pages.append("".join(self.current_stream))
                self.current_stream = []

        def build(self):
            self.finish()
            objects = []
            
            # 1: Catalog
            objects.append("<< /Type /Catalog /Pages 2 0 R >>")
            
            # 2: Pages root (will update kids)
            page_obj_ids = [3 + i * 2 for i in range(len(self.pages))]
            kids_str = " ".join([f"{pid} 0 R" for pid in page_obj_ids])
            objects.append(f"<< /Type /Pages /Kids [{kids_str}] /Count {len(self.pages)} >>")
            
            # Font definitions
            font_helv = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
            font_helv_bold = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
            font_helv_oblique = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"
            
            # Next object id starts at 3
            font_id_1 = 3 + len(self.pages) * 2
            font_id_2 = font_id_1 + 1
            font_id_3 = font_id_2 + 1
            
            # For each page: Page object + Content stream
            for i, page_content in enumerate(self.pages):
                content_id = 4 + i * 2
                stream_bytes = page_content.encode('latin1', 'replace')
                length = len(stream_bytes)
                
                page_obj = f"""<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595.28 841.89]
  /Contents {content_id} 0 R
  /Resources <<
    /Font <<
      /F1 {font_id_1} 0 R
      /F2 {font_id_2} 0 R
      /F3 {font_id_3} 0 R
    >>
  >>
>>"""
                objects.append(page_obj)
                
                content_obj = f"<< /Length {length} >>\nstream\n{page_content}\nendstream"
                objects.append(content_obj)
                
            objects.append(font_helv)
            objects.append(font_helv_bold)
            objects.append(font_helv_oblique)
            
            # Assemble PDF with cross-reference table
            pdf_parts = ["%PDF-1.4\n"]
            offsets = [0]
            current_offset = len(pdf_parts[0].encode('latin1'))
            
            for i, obj in enumerate(objects):
                offsets.append(current_offset)
                obj_str = f"{i+1} 0 obj\n{obj}\nendobj\n"
                pdf_parts.append(obj_str)
                current_offset += len(obj_str.encode('latin1'))
                
            xref_offset = current_offset
            pdf_parts.append(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n")
            for off in offsets[1:]:
                pdf_parts.append(f"{off:010d} 00000 n \n")
                
            pdf_parts.append(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n")
            
            return "".join(pdf_parts).encode('latin1', 'replace')

    # Helper text encoder (replaces accents with Windows-1252 / Latin-1)
    def clean(t):
        return t.replace('é', '\xe9').replace('è', '\xe8').replace('ê', '\xea').replace('à', '\xe0')\
                .replace('ç', '\xe7').replace('ù', '\xf9').replace('ô', '\xf4').replace('î', '\xee')\
                .replace('ï', '\xef').replace('ë', '\xeb').replace('œ', 'oe').replace('’', "'")\
                .replace('—', '-').replace('«', '"').replace('»', '"').replace('€', 'EUR')\
                .replace('⭐', '*').replace('⚡', '*').replace('🏆', '*').replace('📦', '*').replace('📋', '*')

    pdf = SimplePDF()
    
    # ─── PAGE 1 ─────────────────────────────────────────────────────────────
    p1 = []
    
    # Header Background Banner (#241812)
    p1.append("q\n")
    p1.append("0.141 0.094 0.071 rg\n") # Dark brown #241812
    p1.append("36 710 523.28 95 re f\n")
    # Gold border
    p1.append("0.902 0.651 0.208 RG\n") # Gold #E6A635
    p1.append("1.5 w\n")
    p1.append("36 710 523.28 95 re S\n")
    p1.append("Q\n")
    
    # Header Badge Pill
    p1.append("q\n")
    p1.append("0.902 0.651 0.208 rg\n")
    p1.append("50 780 180 14 re f\n")
    p1.append("Q\n")
    
    # Header Text
    p1.append("BT\n")
    p1.append("/F2 8 Tf\n")
    p1.append("0.102 0.067 0.043 rg\n")
    p1.append(f"56 784 Td ({clean('ARCHITECTURE & INFRASTRUCTURE')}) Tj\n")
    p1.append("ET\n")
    
    p1.append("BT\n")
    p1.append("/F2 18 Tf\n")
    p1.append("0.98 0.968 0.949 rg\n")
    p1.append(f"50 754 Td ({clean('Guide d Hebergement - Artisanat Aschi')}) Tj\n")
    p1.append("/F1 9.5 Tf\n")
    p1.append("0.917 0.894 0.851 rg\n")
    p1.append(f"50 726 Td ({clean('Recommandations strategiques, couts, securite et plan de deploiement.')}) Tj\n")
    p1.append("ET\n")
    
    # ── Section 1: Analyse de la Stack ──
    p1.append("BT\n")
    p1.append("/F2 13 Tf\n")
    p1.append("0.231 0.153 0.11 rg\n")
    p1.append(f"36 678 Td ({clean('1. Analyse de la Stack Technique')}) Tj\n")
    p1.append("ET\n")
    
    p1.append("q\n")
    p1.append("0.902 0.651 0.208 RG 1.5 w\n")
    p1.append("36 672 m 559.28 672 l S\n")
    p1.append("Q\n")
    
    # Box Section 1
    p1.append("q\n")
    p1.append("0.98 0.968 0.949 rg\n")
    p1.append("36 575 523.28 88 re f\n")
    p1.append("0.91 0.863 0.796 RG 1 w\n")
    p1.append("36 575 523.28 88 re S\n")
    p1.append("Q\n")
    
    p1.append("BT\n")
    p1.append("/F1 9.5 Tf\n")
    p1.append("0.176 0.137 0.114 rg\n")
    p1.append(f"48 646 Td ({clean('L application Artisanat Aschi est composee de 4 elements majeurs a heberger :')}) Tj\n")
    p1.append(f"48 630 Td ({clean('- Frontend : Next.js 16 (React 19, TypeScript, Tailwind CSS, SSR, animations, 3D).')}) Tj\n")
    p1.append(f"48 614 Td ({clean('- Backend : Spring Boot 3+ (Java 17/21, API REST sous /api, securite JWT, port 8081).')}) Tj\n")
    p1.append(f"48 598 Td ({clean('- Base de donnees : PostgreSQL (produits, devis, categories, livraisons, avis, admin).')}) Tj\n")
    p1.append(f"48 582 Td ({clean('- Medias & Videos : Photos HD atelier, boutons/poignees et videos reels jusqu a 500 Mo.')}) Tj\n")
    p1.append("ET\n")
    
    # ── Section 2: Les Deux Solutions ──
    p1.append("BT\n")
    p1.append("/F2 13 Tf\n")
    p1.append("0.231 0.153 0.11 rg\n")
    p1.append(f"36 545 Td ({clean('2. Les 2 Solutions d Hebergement')}) Tj\n")
    p1.append("ET\n")
    
    p1.append("q\n")
    p1.append("0.902 0.651 0.208 RG 1.5 w\n")
    p1.append("36 539 m 559.28 539 l S\n")
    p1.append("Q\n")
    
    # Card Option 1 (Gold Highlight)
    p1.append("q\n")
    p1.append("0.992 0.984 0.968 rg\n")
    p1.append("36 345 523.28 180 re f\n")
    p1.append("0.902 0.651 0.208 RG 1.5 w\n")
    p1.append("36 345 523.28 180 re S\n")
    p1.append("0.902 0.651 0.208 rg\n")
    p1.append("36 345 5 180 re f\n") # Gold left bar
    p1.append("Q\n")
    
    p1.append("BT\n")
    p1.append("/F2 11 Tf\n")
    p1.append("0.141 0.094 0.071 rg\n")
    p1.append(f"48 506 Td ({clean('[OPTION 1 RECOMMANDEE] Architecture Cloud Decouplee')}) Tj\n")
    p1.append("/F2 8.5 Tf\n")
    p1.append("0.024 0.373 0.275 rg\n")
    p1.append(f"420 506 Td ({clean('GRATUIT puis ~5 $/mois')}) Tj\n")
    
    p1.append("/F1 9 Tf\n")
    p1.append("0.2 0.15 0.12 rg\n")
    p1.append(f"48 488 Td ({clean('Chaque composant est heberge sur la plateforme specialiste la plus performante :')}) Tj\n")
    
    p1.append("/F2 9.5 Tf\n")
    p1.append("0.141 0.094 0.071 rg\n")
    p1.append(f"48 470 Td ({clean('1. Frontend Next.js -> VERCEL (Plan Gratuit)')}) Tj\n")
    p1.append("/F1 8.5 Tf\n")
    p1.append("0.35 0.27 0.23 rg\n")
    p1.append(f"60 458 Td ({clean('Editeur de Next.js. Vitesse mondiale via Edge CDN, SSL automatique, deploiement Git.')}) Tj\n")
    
    p1.append("/F2 9.5 Tf\n")
    p1.append("0.141 0.094 0.071 rg\n")
    p1.append(f"48 440 Td ({clean('2. Backend Spring Boot -> RENDER.com ou RAILWAY.app (~5 $/mois)')}) Tj\n")
    p1.append("/F1 8.5 Tf\n")
    p1.append("0.35 0.27 0.23 rg\n")
    p1.append(f"60 428 Td ({clean('Deploiement Java Maven automatique, redemarrage auto en cas de panne, HTTPS inclus.')}) Tj\n")
    
    p1.append("/F2 9.5 Tf\n")
    p1.append("0.141 0.094 0.071 rg\n")
    p1.append(f"48 410 Td ({clean('3. Base PostgreSQL -> NEON.tech ou SUPABASE (Plan Gratuit)')}) Tj\n")
    p1.append("/F1 8.5 Tf\n")
    p1.append("0.35 0.27 0.23 rg\n")
    p1.append(f"60 398 Td ({clean('PostgreSQL manage haute performance avec sauvegardes automatiques quotidiennes.')}) Tj\n")
    
    p1.append("/F2 9.5 Tf\n")
    p1.append("0.141 0.094 0.071 rg\n")
    p1.append(f"48 380 Td ({clean('4. Medias & Videos lourdes -> CLOUDINARY ou SUPABASE STORAGE')}) Tj\n")
    p1.append("/F1 8.5 Tf\n")
    p1.append("0.35 0.27 0.23 rg\n")
    p1.append(f"60 368 Td ({clean('Streaming video ultra-fluide et compression automatique des photos en WebP / AVIF.')}) Tj\n")
    p1.append("ET\n")
    
    # Card Option 2 (VPS Unique)
    p1.append("q\n")
    p1.append("0.98 0.968 0.949 rg\n")
    p1.append("36 215 523.28 115 re f\n")
    p1.append("0.91 0.863 0.796 RG 1 w\n")
    p1.append("36 215 523.28 115 re S\n")
    p1.append("Q\n")
    
    p1.append("BT\n")
    p1.append("/F2 11 Tf\n")
    p1.append("0.141 0.094 0.071 rg\n")
    p1.append(f"48 310 Td ({clean('[OPTION 2] Serveur Dedie VPS Unique avec Docker')}) Tj\n")
    p1.append("/F2 8.5 Tf\n")
    p1.append("0.573 0.251 0.055 rg\n")
    p1.append(f"410 310 Td ({clean('4,50 a 6,00 EUR / mois fixe')}) Tj\n")
    
    p1.append("/F1 9 Tf\n")
    p1.append("0.2 0.15 0.12 rg\n")
    p1.append(f"48 292 Td ({clean('Tous les services tournent sur une seule machine Linux (Hetzner CX22 ou OVHcloud).')}) Tj\n")
    p1.append(f"48 276 Td ({clean('- Structure : Docker Next.js + Docker Spring Boot + Docker PostgreSQL + Nginx SSL.')}) Tj\n")
    p1.append(f"48 260 Td ({clean('- Avantages : Cout mensuel fixe, controle total, pas de limite de requetes ni de bande passante.')}) Tj\n")
    p1.append(f"48 244 Td ({clean('- Inconvenients : Maintenance manuelle requise (mises a jour Linux, securite, certificats).')}) Tj\n")
    p1.append("ET\n")
    
    # ── Section 3: Tableau Comparatif ──
    p1.append("BT\n")
    p1.append("/F2 12 Tf\n")
    p1.append("0.231 0.153 0.11 rg\n")
    p1.append(f"36 185 Td ({clean('3. Tableau Comparatif')}) Tj\n")
    p1.append("ET\n")
    
    # Table Header
    p1.append("q\n")
    p1.append("0.231 0.153 0.11 rg\n")
    p1.append("36 150 523.28 20 re f\n")
    p1.append("Q\n")
    
    p1.append("BT\n")
    p1.append("/F2 8.5 Tf\n")
    p1.append("1 1 1 rg\n")
    p1.append(f"44 156 Td ({clean('Critere')}) Tj\n")
    p1.append(f"160 156 Td ({clean('Option 1 : Cloud Decouple (Vercel+Render)')}) Tj\n")
    p1.append(f"380 156 Td ({clean('Option 2 : VPS Unique (Hetzner Docker)')}) Tj\n")
    p1.append("ET\n")
    
    # Table Rows
    rows = [
        ("Cout mensuel", "0 EUR au lancement, puis ~5 $/mois", "4,50 EUR a 6,00 EUR / mois fixe"),
        ("Facilite deploiement", "Tres facile (Zero ligne Linux)", "Moyenne (Docker Compose & Nginx)"),
        ("Vitesse Next.js", "Maximale (CDN Edge Vercel)", "Tres bonne (selon localisation VPS)"),
        ("Gestion videos (500 Mo)", "Cloudinary / Supabase (CDN dedie)", "Disque SSD NVMe du serveur"),
        ("Maintenance", "0 maintenance (gere par hebergeurs)", "Mises a jour Linux manuelles"),
    ]
    
    for idx, (c1, c2, c3) in enumerate(rows):
        y = 132 - idx * 16
        bg_col = "0.98 0.968 0.949 rg\n" if idx % 2 == 0 else "1 1 1 rg\n"
        p1.append(f"q\n{bg_col}36 {y} 523.28 16 re f\n0.91 0.863 0.796 RG 0.5 w\n36 {y} 523.28 16 re S\nQ\n")
        p1.append("BT\n/F2 8 Tf\n0.141 0.094 0.071 rg\n")
        p1.append(f"44 {y+4} Td ({clean(c1)}) Tj\n")
        p1.append("/F1 8 Tf\n0.2 0.15 0.12 rg\n")
        p1.append(f"160 {y+4} Td ({clean(c2)}) Tj\n")
        p1.append(f"380 {y+4} Td ({clean(c3)}) Tj\n")
        p1.append("ET\n")
        
    # Footer
    p1.append("BT\n/F3 8 Tf\n0.55 0.48 0.42 rg\n")
    p1.append(f"200 24 Td ({clean('Artisanat Aschi - Document Technique de Mise en Production (Page 1/2)')}) Tj\n")
    p1.append("ET\n")
    
    pdf.add_stream("".join(p1))
    pdf.new_page()
    
    # ─── PAGE 2 ─────────────────────────────────────────────────────────────
    p2 = []
    
    # Header Mini
    p2.append("q\n")
    p2.append("0.141 0.094 0.071 rg\n")
    p2.append("36 780 523.28 35 re f\n")
    p2.append("0.902 0.651 0.208 RG 1 w\n")
    p2.append("36 780 523.28 35 re S\n")
    p2.append("Q\n")
    
    p2.append("BT\n/F2 12 Tf\n0.98 0.968 0.949 rg\n")
    p2.append(f"50 792 Td ({clean('Guide de Deploiement & Checklist Technique - Artisanat Aschi')}) Tj\n")
    p2.append("ET\n")
    
    # ── Section 4: Checklist Technique ──
    p2.append("BT\n/F2 13 Tf\n0.231 0.153 0.11 rg\n")
    p2.append(f"36 745 Td ({clean('4. Checklist des Fichiers de Configuration a Adapter')}) Tj\n")
    p2.append("ET\n")
    
    p2.append("q\n0.902 0.651 0.208 RG 1.5 w\n36 739 m 559.28 739 l S\nQ\n")
    
    # Check 1: SecurityConfig.java
    p2.append("BT\n/F2 10.5 Tf\n0.757 0.49 0.349 rg\n")
    p2.append(f"36 718 Td ({clean('A. Configuration CORS du Backend (SecurityConfig.java)')}) Tj\n")
    p2.append("/F1 8.5 Tf\n0.2 0.15 0.12 rg\n")
    p2.append(f"36 704 Td ({clean('Autoriser votre domaine de production pour que le frontend communique avec l API :')}) Tj\n")
    p2.append("ET\n")
    
    # Code box 1
    p2.append("q\n0.102 0.067 0.043 rg\n36 620 523.28 74 re f\n0.231 0.153 0.11 RG 1 w\n36 620 523.28 74 re S\nQ\n")
    p2.append("BT\n/F1 8 Tf\n0.95 0.95 0.95 rg\n")
    p2.append(f"46 678 Td (// Dans backend/src/main/java/.../config/SecurityConfig.java) Tj\n")
    p2.append(f"46 664 Td (configuration.setAllowedOrigins(Arrays.asList() Tj\n")
    p2.append(f"46 650 Td (    \"https://artisanataschi.com\",) Tj\n")
    p2.append(f"46 636 Td (    \"https://www.artisanataschi.com\") Tj\n")
    p2.append(f"46 624 Td ());) Tj\n")
    p2.append("ET\n")
    
    # Check 2: .env.production
    p2.append("BT\n/F2 10.5 Tf\n0.757 0.49 0.349 rg\n")
    p2.append(f"36 595 Td ({clean('B. URL de Production du Frontend (.env.production)')}) Tj\n")
    p2.append("/F1 8.5 Tf\n0.2 0.15 0.12 rg\n")
    p2.append(f"36 581 Td ({clean('Definir l adresse de votre API hebergee dans le frontend Next.js :')}) Tj\n")
    p2.append("ET\n")
    
    # Code box 2
    p2.append("q\n0.102 0.067 0.043 rg\n36 530 523.28 42 re f\n0.231 0.153 0.11 RG 1 w\n36 530 523.28 42 re S\nQ\n")
    p2.append("BT\n/F1 8 Tf\n0.95 0.95 0.95 rg\n")
    p2.append(f"46 556 Td (NEXT_PUBLIC_API_URL=https://api.artisanataschi.com/api) Tj\n")
    p2.append(f"46 540 Td (NEXT_PUBLIC_SITE_URL=https://artisanataschi.com) Tj\n")
    p2.append("ET\n")
    
    # Check 3: application.yml
    p2.append("BT\n/F2 10.5 Tf\n0.757 0.49 0.349 rg\n")
    p2.append(f"36 505 Td ({clean('C. Variables Backend de Production (application.yml)')}) Tj\n")
    p2.append("/F1 8.5 Tf\n0.2 0.15 0.12 rg\n")
    p2.append(f"36 491 Td ({clean('Connecter la base de donnees distante et securiser les tokens JWT :')}) Tj\n")
    p2.append("ET\n")
    
    # Code box 3
    p2.append("q\n0.102 0.067 0.043 rg\n36 395 523.28 86 re f\n0.231 0.153 0.11 RG 1 w\n36 395 523.28 86 re S\nQ\n")
    p2.append("BT\n/F1 8 Tf\n0.95 0.95 0.95 rg\n")
    p2.append(f"46 465 Td (spring:) Tj\n")
    p2.append(f"46 451 Td (  datasource:) Tj\n")
    p2.append(f"46 437 Td (    url: ${clean('{SPRING_DATASOURCE_URL:jdbc:postgresql://ep-xyz.neon.tech/artisanat_aschi}')}) Tj\n")
    p2.append(f"46 423 Td (    username: ${clean('{SPRING_DATASOURCE_USERNAME:postgres}')}) Tj\n")
    p2.append(f"46 409 Td (    password: ${clean('{SPRING_DATASOURCE_PASSWORD:votre_mot_de_passe}')}) Tj\n")
    p2.append("ET\n")
    
    # ── Section 5: Plan d'Action Etape par Etape ──
    p2.append("BT\n/F2 13 Tf\n0.231 0.153 0.11 rg\n")
    p2.append(f"36 365 Td ({clean('5. Plan d Action : Les 4 Etapes de Lancement')}) Tj\n")
    p2.append("ET\n")
    
    p2.append("q\n0.902 0.651 0.208 RG 1.5 w\n36 359 m 559.28 359 l S\nQ\n")
    
    steps = [
        ("Etape 1 : Creer la base PostgreSQL sur Neon.tech ou Supabase", "Creer un compte gratuit sur neon.tech, creer la base 'artisanat_aschi' et copier la chaine de connexion JDBC."),
        ("Etape 2 : Deployer le Backend Spring Boot sur Render ou Railway", "Connecter votre depot GitHub. Definir les variables d environnement (SPRING_DATASOURCE_URL, JWT_SECRET)."),
        ("Etape 3 : Deployer le Frontend sur Vercel", "Importer le projet sur vercel.com. Configurer NEXT_PUBLIC_API_URL avec l URL Render de l etape 2."),
        ("Etape 4 : Lier le Nom de Domaine (artisanataschi.com)", "Chez votre registrar (OVH, Namecheap, GoDaddy), pointer le domaine vers Vercel et api. vers Render.")
    ]
    
    y_step = 335
    for title, desc in steps:
        p2.append("q\n0.98 0.968 0.949 rg\n")
        p2.append(f"36 {y_step-30} 523.28 38 re f\n")
        p2.append("0.91 0.863 0.796 RG 0.5 w\n")
        p2.append(f"36 {y_step-30} 523.28 38 re S\n")
        p2.append("0.902 0.651 0.208 rg\n")
        p2.append(f"36 {y_step-30} 4 38 re f\nQ\n")
        
        p2.append("BT\n/F2 9.5 Tf\n0.141 0.094 0.071 rg\n")
        p2.append(f"48 {y_step-6} Td ({clean(title)}) Tj\n")
        p2.append("/F1 8.5 Tf\n0.35 0.27 0.23 rg\n")
        p2.append(f"48 {y_step-22} Td ({clean(desc)}) Tj\n")
        p2.append("ET\n")
        y_step -= 46
        
    # Final note card
    p2.append("q\n0.902 0.651 0.208 rg\n36 100 523.28 35 re f\nQ\n")
    p2.append("BT\n/F2 9.5 Tf\n0.102 0.067 0.043 rg\n")
    p2.append(f"48 120 Td ({clean('CONCLUSION & RECOMMANDATION FINALE')}) Tj\n")
    p2.append("/F1 8.5 Tf\n0.141 0.094 0.071 rg\n")
    p2.append(f"48 108 Td ({clean('L Option 1 (Vercel + Render + Neon) garantit une vitesse de pointe, 0 panne et 0 EUR au lancement.')}) Tj\n")
    p2.append("ET\n")
    
    # Footer
    p2.append("BT\n/F3 8 Tf\n0.55 0.48 0.42 rg\n")
    p2.append(f"200 24 Td ({clean('Artisanat Aschi - Document Technique de Mise en Production (Page 2/2)')}) Tj\n")
    p2.append("ET\n")
    
    pdf.add_stream("".join(p2))
    
    pdf_bytes = pdf.build()
    
    with open(filename, "wb") as f:
        f.write(pdf_bytes)
        
    print(f"PDF successfully created: {filename} ({len(pdf_bytes)} bytes)")

if __name__ == "__main__":
    create_pdf()
