# 📋 Inventaire des Dernières Photos et Vidéos Ajoutées

Ce document récapitule précisément les derniers médias (photos et vidéos) ajoutés récemment sur le site **Artisanat Aschi**, avec leurs dates d'ajout, leurs tailles compressées et leur affectation dans le site (projets d'exception ou produits).

---

## 🏛️ 1. Derniers Projets Clés en Main Ajoutés

### 📌 1. Projet : "Villa d'exception" (Ajouté le 26 Septembre 2026)
* **Vidéo (12,57 Mo)** : `1790416203249-lv_0_20260918163259.mp4`
* **Photos (5 photos)** :
  1. `1790415810992-IMG_20241226_135610.jpg` (290 Ko)
  2. `1790416018105-IMG-20240703-WA0006.jpg` (280 Ko)
  3. `1790416056444-IMG_20241226_134702.jpg` (250 Ko)
  4. `1790416075651-IMG_20241226_135341.jpg` (380 Ko)
  5. `1790416098107-IMG_20241226_135707.jpg` (240 Ko)

---

### 📌 2. Projet : "وزارة الشؤون الخارجية والهجرة والتونسيين بالخارج" (Ajouté le 25 Septembre 2026)
* **Vidéo (2,62 Mo)** : `1790323039663-lv_0_20260922171936.mp4`
* **Photos (5 photos)** :
  1. `1790322788691-IMG_20240726_120052.jpg` (380 Ko)
  2. `1790322820477-IMG_20240722_142600.jpg` (630 Ko)
  3. `1790322841698-IMG_20240722_141903.jpg` (440 Ko)
  4. `1790322907877-IMG_20240722_144616.jpg` (80 Ko)
  5. `1790322949720-IMG_20240805_135713.jpg` (320 Ko)

---

### 📌 3. Projet : "AFI ( agence fonciere industrielle )" (Ajouté le 20-21 Septembre 2026)
* **Vidéo (10,61 Mo)** : `1789913768743-lv_0_20260910130311.mp4`
* **Photos (3 photos)** :
  1. `1789921862597-afi.png` (430 Ko)
  2. `1789985983070-IMG_20260413_110154.jpg` (200 Ko)
  3. `1789986019270-IMG_20251217_191434.jpg` (170 Ko)

---

### 📌 4. Projet : "Maison d'hôte Diar Ali" (Ajouté le 20 Septembre 2026)
* **Vidéo (16,27 Mo)** : `1789912103615-lv_0_20260904092720.mp4` *(Initialement 148,9 Mo, compressée)*
* **Photo (1 photo)** : `1789912567876-Capture_d__cran_2026-09-20_145520.png` (630 Ko)

---

### 📌 5. Autres Projets Clés en Main Actifs
* **Villa de Maître Carthage** :
  * Vidéo (9,07 Mo) : `1788412722399-villacarthage.mp4`
  * Photo : `1789988672234-Capture_d__cran_2026-09-21_120344.png` (580 Ko)
* **Villa d'Exception Soukra** :
  * Vidéo (14,03 Mo) : `1788370150280-villasoukra.mp4`
  * Photo : `1789913226687-villa_soukra.png` (420 Ko)
* **Hôtel El Menara** :
  * Vidéo (12,72 Mo) : `0ca5bec6-900a-4232-b65c-81658df964f2.mp4`
  * Photo : `84599123-a85c-47c7-b794-f9e5b8323ea3.png`

---

## 🪑 2. Derniers Produits / Meubles Ajoutés au Catalogue (13 Septembre 2026)

| Date d'ajout | Meuble / Produit | Fichier Photo | Taille |
| :--- | :--- | :--- | :---: |
| 13/09/2026 15:08 | **Buffet — Modèle 35** (ID 209) | `1789308505301-ChatGPT_Image_10_sept._2026__11_21_44.png` | 680 Ko |
| 13/09/2026 15:07 | **Buffet — Modèle 34** (ID 200) | `1789308467509-ChatGPT_Image_10_sept._2026__11_18_30.png` | 760 Ko |
| 13/09/2026 15:07 | **Buffet — Modèle 33** (ID 203) | `1789308431341-ChatGPT_Image_10_sept._2026__11_13_59.png` | 770 Ko |
| 13/09/2026 15:05 | **Buffet — Modèle 32** (ID 199) | `1789308339296-ChatGPT_Image_10_sept._2026__11_08_59.png` | 710 Ko |
| 13/09/2026 11:45 | **Commode — Modèle 07** (ID 186) | `1789296345989-Gemini_Generated_Image_869t33869t33869t.jpg` | 160 Ko |

---

## 💡 Note pour votre collègue pour la migration vers Supabase Storage

1. **Dossier source** : Le dossier `public/uploads` a déjà été nettoyé et optimisé :
   - Les 101 fichiers orphelins (inutilisés) ont été isolés.
   - Les 211 fichiers restants sont **exactement les fichiers affichés sur le site**.
   - Le dossier ne pèse plus que **175 Mo** (au lieu de 1,3 Go).
2. **Migration en 1 seule commande** :
   Un script prêt à l'emploi existe dans le projet :
   ```bash
   SUPABASE_KEY=votre_cle_service_role node scripts/migrate-media-to-supabase.js
   ```
   Ce script :
   - Crée le bucket `media` sur Supabase Storage.
   - Envoie les 211 fichiers optimisés.
   - Met à jour automatiquement toutes les URLs dans la base PostgreSQL de Supabase.
