# Fiche Technique & Prompt de Génération - Artisanat Aschi

Ce document contient toutes les informations techniques, esthétiques et fonctionnelles du site **Artisanat Aschi** (Maison fondée en 1960), suivi d'un **Master Prompt** ultra-détaillé prêt à être fourni à une autre IA de codage pour reconstruire le projet à l'identique.

---

## 1. Informations Générales & Fonctionnalités

### Le Concept
**Artisanat Aschi** est une vitrine et un espace d'administration de luxe pour un atelier de sculpture sur bois noble tunisien (noyer massif, olivier). L'accent est mis sur le prestige, le savoir-faire ancestral, les créations haut de gamme et les services personnalisés.

### Pages du Site Public
1. **Accueil (Hero Section)** : Redessiné pour être immersif, avec une image d'arrière-plan de l'atelier assombrie, une typographie élégante, un bouton d'action principal et des animations fluides.
2. **L'Atelier (`/atelier`)** : Raconte l'histoire de la maison depuis 1960 et présente les techniques de sculpture.
3. **Nos Services (Menu Déroulant)** :
   - **Service Catalogue (`/catalogue`)** : Présentation interactive des créations d'inspiration passées pour inciter à la commande.
   - **Service Relooking (`/relooking`)** : Présentation du service de restauration et de relooking de meubles anciens.
4. **Créations (`/creations` & `/produits/[id]`)** : Catalogue de produits détaillés.
5. **Configuration sur mesure (`/custom-creation`)** : Formulaire interactif guidant l'utilisateur pour formuler son projet de meuble personnalisé.
6. **Actualités (`/actualites` / Section actualités de l'accueil)** : Un flux type blog premium avec temps de lecture calculé, badge "Nouveau" pour les articles récents et animations au survol.
7. **Contact (`/contact`)** : Formulaire de demande de devis personnalisé.

### Espace Administration (`/admin`)
Tout l'espace admin a été refondu avec un **thème sombre luxueux "Noyer Massif & Or"** (`bg-[#1a1512]` pour le fond et accents `#C9A84C`) :
1. **Dashboard (`/admin/dashboard`)** :
   - Graphique interactif en courbe dorée (`recharts` AreaChart) montrant la tendance des demandes de devis.
   - Cartes KPI animées pour le chiffre d'affaires, les produits, les devis et les actualités.
   - Tableau des derniers devis reçus.
   - **Système de Fallback (Mock Data)** : Si l'API backend Spring Boot n'est pas lancée (ex: Docker éteint), le tableau de bord bascule automatiquement sur des données fictives réalistes pour rester opérationnel visuellement sans planter.
2. **Gestion du Catalogue (`/admin/catalogue`)** : Grille de cartes dynamiques pour ajouter, modifier et supprimer les meubles d'inspiration. Modales d'édition avec le même thème sombre.
3. **Gestion des Produits (`/admin/products`)** : Grille de données premium (Data Grid) avec animations `framer-motion`, badges d'état lumineux (En stock / Sur commande), et fonctionnalités complètes de CRUD.
4. **Gestion des Actualités (`/admin/news`)** : Interface de type flux avec barre de recherche en temps réel et prévisualisation instantanée.

### Stack Technique
* **Frontend** : Next.js (App Router, TypeScript, React), Tailwind CSS (variables de couleurs personnalisées), Lucide React (icônes).
* **Animations** : Framer Motion (animations d'apparition progressive, zooms et mouvements au survol).
* **Graphiques** : Recharts (AreaChart customisé doré).
* **Backend** : API REST en Java Spring Boot (port par défaut `8081`).
* **Base de données** : PostgreSQL via Docker.

---

## 2. Charte Graphique (Luxury Design System)
* **Noyer Profond / Walnut** : `#1a1512` (Utilisé pour le fond de l'admin, les modales et la barre de navigation).
* **Or / Gold** : `#C9A84C` (Utilisé pour les boutons principaux, les bordures fines d'accentuation, les liens actifs et les graphiques).
* **Bronze** : `#8C7853` (Couleur secondaire pour les sous-titres et survol).
* **Ivoire / Ivory** : `#FDFBF7` (Couleur principale du texte sur fond sombre).
* **Muted Ivory** : rgba(253, 251, 247, 0.6) (Pour le texte secondaire).
* **Effets** : Glassmorphism (`backdrop-blur-md bg-walnut/50 border border-gold/10`) et ombres diffuses dorées.

---

## 3. Master Prompt pour une autre IA de Codage

Copiez-collez le prompt ci-dessous dans n'importe quel agent IA de développement (Cursor, Claude, etc.) pour recréer ce projet.

```markdown
Vous êtes un développeur Next.js senior spécialisé dans les interfaces web haut de gamme, animées et interactives. Votre mission est de créer un site web vitrine et d'administration complet pour "Artisanat Aschi", un atelier prestigieux de sculpture sur bois de noyer massif et d'olivier fondé en 1960.

### 1. STACK TECHNIQUE
- Framework : Next.js (App Router, TypeScript, React)
- Styles : Tailwind CSS (créer un jeu de variables pour un thème sombre de luxe et beige clair pour le public)
- Icônes : Lucide React
- Graphiques : Recharts (pour le tableau de bord d'administration)
- Animations : Framer Motion (transitions de page fluides, survol interactifs, apparitions en cascade)

### 2. CHARTE GRAPHIQUE (Luxury Design System)
- Fond Sombre Admin : Noir Noyer #1a1512
- Texte Clair Admin : Ivoire #FDFBF7
- Couleur d'Accent : Or #C9A84C (effet de lueur dorée pour les éléments actifs)
- Thème Public : Beige clair noble, bois chaud et accents dorés.
- Effets visuels : Glassmorphism (panneaux translucides avec flou d'arrière-plan, bordures dorées ultra-fines de 1px).

### 3. ARCHITECTURE DES PAGES À GÉNÉRER

#### A. ZONE PUBLIQUE
1. **Page d'Accueil (`/`)** :
   - Hero Section : Image de fond de l'atelier assombrie avec effet parallaxe, typographie fine avec empattement, CTA doré.
   - Barre de Navigation (Navbar) : Menu déroulant au clic/survol sur "Nos Services" qui affiche deux choix élégants avec photo et description :
     * Catalogue d'Inspiration (redirection vers `/catalogue`)
     * Relooking & Restauration (redirection vers `/relooking`)
   - Section "L'Atelier" : Texte historique sur la transmission du savoir-faire.
   - Section "Actualités" : Flux de cartes de blog. Chaque carte doit flotter au survol (+ zoom image), afficher la date, le temps de lecture calculé (ex: "3 min") et un badge doré "Nouveau" si l'article est récent.
   - Section Contact & Devis.
2. **Page Relooking (`/relooking`)** : Présentation du service de rénovation avec galerie avant/après.
3. **Page Catalogue (`/catalogue`)** : Affichage sous forme de grille raffinée des créations passées de l'atelier.
4. **Page Custom Creation (`/custom-creation`)** : Formulaire multi-étapes interactif pour configurer une pièce de meuble sur mesure (type de bois, dimensions, type de sculpture).

#### B. ZONE ADMINISTRATION (`/admin`)
Toutes les pages de cette zone doivent adopter un fond `#1a1512` avec un menu latéral élégant.
1. **Layout Admin (`/admin/layout.tsx`)** : Barre latérale noire et dorée avec navigation vers le Dashboard, les Produits, le Catalogue, et les Actualités.
2. **Dashboard (`/admin/dashboard/page.tsx`)** :
   - Bannière d'accueil animée personnalisée.
   - 4 cartes de statistiques KPI au style épuré et brillant.
   - Graphique linéaire (`AreaChart` de Recharts) avec remplissage dégradé doré représentant les tendances des devis.
   - Tableau des derniers devis reçus.
   - **CRITIQUE** : Mettre en place un système de repli (Fallback) utilisant un tableau de données fictives réalistes si les requêtes fetch vers l'API backend échouent. L'interface ne doit jamais crasher.
3. **Gestion des Produits (`/admin/products/page.tsx`)** :
   - Tableau des produits stylisé avec effet de flou et lignes animées avec `framer-motion`.
   - Badges dorés ou rouges pour l'état de disponibilité ("En stock" / "Sur commande").
   - Modale sombre d'ajout/édition avec téléchargeur d'images.
4. **Gestion du Catalogue (`/admin/catalogue/page.tsx`)** :
   - Grille de cartes épurées représentant le catalogue d'inspiration.
   - Fonctions d'ajout, modification et suppression intégrées dans des composants animés.
5. **Gestion des Actualités (`/admin/news/page.tsx`)** :
   - Liste des articles de blog avec une barre de recherche fonctionnelle en temps réel.
   - Calcul automatique du temps de lecture en fonction du nombre de mots.

### 4. INTÉGRATION API ET MOCK DATA (`lib/api.ts`)
Créer un fichier d'API centralisé configuré pour pointer vers `http://localhost:8081/api` (Spring Boot). Les méthodes doivent gérer les produits, actualités, devis et l'envoi d'images. Si l'API échoue, les composants de page doivent attraper l'erreur et charger des données statiques pré-définies (Mocks) pour rester présentables.

Générez le code propre, commenté, et sans aucune ligne tronquée.
```
