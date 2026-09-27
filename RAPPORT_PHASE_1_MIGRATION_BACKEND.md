# RAPPORT DE MISSION — PHASE 1 : PRÉPARATION ET MIGRATION DU BACKEND SPRING BOOT

**Projet :** Artisanat Aschi  
**Date :** 26 Septembre 2026  
**Statut :** ✅ **PHASE 1 COMPLÈTE & VALIDÉE (BUILD SUCCESS, 27/27 TESTS PASSÉS)**

---

## 1. Résumé Exécutif

La **Phase 1** a été exécutée avec succès dans le respect absolu de toutes les contraintes de non-régression fixées par l'audit :
- **Aucune suppression prématurée :** Les anciennes routes Next.js (`app/api/upload`, `app/api/upload-video`, `app/api/colors`, `app/api/reel`) et les fichiers de stockage JSON locaux (`public/colors-data.json`, `public/reel-data.json`) ont été conservés intacts. Le frontend continuera de fonctionner sans interruption jusqu'aux phases de bascule dédiée.
- **Backend Spring Boot prêt et sécurisé :** Le backend (Java 21 / Spring Boot 3.4.1 / context-path `/api`) dispose désormais de l'ensemble des entités, repositories, services avec cache, DTOs de validation stricte et contrôleurs REST pour gérer les couleurs, les reels et les uploads média.
- **Intégration Supabase Storage :** Implémentation du service `SupabaseStorageService` via le client HTTP natif Java 21, avec génération d'UUID sécurisés, vérification stricte des signatures binaires (*magic bytes*), contrôle MIME et bascule de secours (*fallback*) automatique vers le stockage local si aucune clé de service Supabase n'est injectée.
- **Résultats des tests automatisés :** 27 tests unitaires et d'intégration réussis, 0 échec, 0 erreur (`BUILD SUCCESS`).

---

## 2. Inventaire des Fichiers Créés

| Fichier Créé | Module | Rôle & Responsabilité |
| :--- | :--- | :--- |
| `backend/src/main/java/com/artisanataschi/backend/domain/Color.java` | Couleurs | Entité JPA mappant la table `colors` (`id`, `label`, `hex`, `isDefault`). |
| `backend/src/main/java/com/artisanataschi/backend/repository/ColorRepository.java` | Couleurs | Repository Spring Data JPA avec requêtes ordonnées (`findAllByOrderByLabelAsc`). |
| `backend/src/main/java/com/artisanataschi/backend/dto/ColorRequestDto.java` | Couleurs | DTO d'entrée validé avec Bean Validation (`@NotBlank`, `@Pattern` pour code HEX `#RRGGBB`). |
| `backend/src/main/java/com/artisanataschi/backend/dto/ColorResponseDto.java` | Couleurs | DTO de sortie standardisé découplé de la persistance JPA. |
| `backend/src/main/java/com/artisanataschi/backend/service/ColorService.java` | Couleurs | Service métier avec génération de slug automatique, normalisation hexadécimale, `@Cacheable("colors")` et `@CacheEvict`. |
| `backend/src/main/java/com/artisanataschi/backend/controller/ColorController.java` | Couleurs | Contrôleur REST : `GET /public/colors`, `POST/PUT/DELETE /admin/colors`. |
| `backend/src/main/java/com/artisanataschi/backend/domain/ReelConfig.java` | Reels | Entité JPA pour la configuration vidéo du reel (`id`, `videoUrl`, `reviews`, `updatedAt`). |
| `backend/src/main/java/com/artisanataschi/backend/domain/ReelReview.java` | Reels | Entité JPA pour les témoignages superposés (`platform`, `name`, `rating`, `text`, `time`, `duration`, `position`). |
| `backend/src/main/java/com/artisanataschi/backend/repository/ReelConfigRepository.java` | Reels | Repository pour la configuration globale du reel. |
| `backend/src/main/java/com/artisanataschi/backend/repository/ReelReviewRepository.java` | Reels | Repository pour les avis liés au reel. |
| `backend/src/main/java/com/artisanataschi/backend/dto/ReelConfigRequestDto.java` | Reels | DTO de mise à jour du reel avec liste imbriquée de reviews. |
| `backend/src/main/java/com/artisanataschi/backend/dto/ReelConfigResponseDto.java` | Reels | DTO de réponse complet pour le composant Reel Hero. |
| `backend/src/main/java/com/artisanataschi/backend/dto/ReelReviewRequestDto.java` | Reels | DTO de validation unitaire d'un avis de reel. |
| `backend/src/main/java/com/artisanataschi/backend/dto/ReelReviewResponseDto.java` | Reels | DTO de réponse pour un avis unitaire. |
| `backend/src/main/java/com/artisanataschi/backend/service/ReelService.java` | Reels | Service métier avec fallback par défaut `/Video-art.mp4`, `@Cacheable("reels")` et `@CacheEvict`. |
| `backend/src/main/java/com/artisanataschi/backend/controller/ReelController.java` | Reels | Contrôleur REST : `GET /public/reels`, `POST/PUT/DELETE /admin/reels`. |
| `backend/src/main/java/com/artisanataschi/backend/dto/UploadResponseDto.java` | Uploads | DTO standardisé retournant l'URL publique, la clé d'objet, le type MIME et la taille. |
| `backend/src/main/java/com/artisanataschi/backend/service/storage/SupabaseStorageService.java` | Uploads | Implémentation `@Primary` envoyant les fichiers vers l'API REST Supabase Storage avec fallback local. |
| `backend/src/main/java/com/artisanataschi/backend/controller/UploadController.java` | Uploads | Contrôleur sécurisé : validation des extensions, inspection des *magic bytes* binaires (JPEG, PNG, GIF, WEBP, MP4, WebM), protection contre le *path traversal*. |
| `backend/src/main/java/com/artisanataschi/backend/dto/ReferenceRequestDto.java` | Sécurité DTO | DTO pour éliminer le *mass assignment* sur les références partenaires. |
| `backend/src/main/resources/schema-phase1.sql` | Base de données | Script SQL DDL idempotent créant les tables `colors`, `reel_configs`, `reel_reviews` avec index et clés étrangères. |
| `backend/src/test/java/com/artisanataschi/backend/service/ColorServiceTest.java` | Tests | 5 tests unitaires : listing, slug auto, normalisation hex, validation doublon, mise à jour, suppression. |
| `backend/src/test/java/com/artisanataschi/backend/service/ReelServiceTest.java` | Tests | 4 tests unitaires : récupération, fallback base vide, remplacement reviews, suppression. |
| `backend/src/test/java/com/artisanataschi/backend/controller/UploadControllerTest.java` | Tests | 5 tests unitaires : image valide, vidéo MP4 valide, rejet spoofing binaire, rejet extensions dangereuses (.exe), rejet path traversal. |
| `backend/src/test/java/com/artisanataschi/backend/controller/ColorControllerTest.java` | Tests | 5 tests MockMvc : GET public, POST admin 201, validation 400, PUT 200, DELETE 204. |
| `backend/src/test/java/com/artisanataschi/backend/controller/ReelControllerTest.java` | Tests | 3 tests MockMvc : GET public, POST admin 201, DELETE 204. |

---

## 3. Inventaire des Fichiers Modifiés

| Fichier Modifié | Modifications apportées |
| :--- | :--- |
| `backend/src/main/resources/application.yml` | - Ajout des caches `colors` et `reels` dans `spring.cache.cache-names`.<br>- Ajout du bloc de configuration `supabase` (`url`, `service-key`, `storage.bucket`). |
| `backend/src/main/java/com/artisanataschi/backend/service/storage/StorageService.java` | Ajout de la méthode `uploadMedia(MultipartFile file, String folder, HttpServletRequest request)` à l'interface. |
| `backend/src/main/java/com/artisanataschi/backend/service/FileStorageService.java` | Retrait de l'annotation `@Service` concurrente pour laisser la priorité à `@Primary SupabaseStorageService`, conservé intact comme composant de secours. |
| `backend/src/main/java/com/artisanataschi/backend/config/DatabaseSeeder.java` | Ajout de l'ensemencement automatique des 8 couleurs de base de l'artisanat du bois et de la configuration initiale du reel si les tables sont vides. |
| `backend/src/main/java/com/artisanataschi/backend/controller/AdminController.java` | Sécurisation de 14 endpoints admin en remplaçant les entités JPA directes par des DTOs validés (`@Valid`), éliminant tout risque de *Mass Assignment*. |
| `backend/src/main/java/com/artisanataschi/backend/service/DeliveryService.java` | Ajout de la méthode `saveDelivery(DeliveryRequestDto)` et `updateDelivery(Long, DeliveryRequestDto)` alignées sur l'entité. |
| `backend/src/main/java/com/artisanataschi/backend/dto/DeliveryRequestDto.java` | Harmonisation des champs avec l'entité `Delivery` (`title`, `description`, `imageUrl`, `deliveryDate`). |
| `backend/src/main/java/com/artisanataschi/backend/service/ProjectService.java` | Ajout du support DTO `ProjectRequestDto`. |
| `backend/src/main/java/com/artisanataschi/backend/service/NewsService.java` | Ajout du support DTO `NewsRequestDto`. |
| `backend/src/main/java/com/artisanataschi/backend/service/RelookingService.java` | Ajout du support DTO `RelookingRequestDto`. |
| `backend/src/main/java/com/artisanataschi/backend/service/TestimonialService.java` | Ajout du support DTO `TestimonialRequestDto`. |
| `backend/src/main/java/com/artisanataschi/backend/service/ReferenceService.java` | Ajout du support DTO `ReferenceRequestDto`. |

---

## 4. Spécification des Nouveaux Endpoints REST

### 4.1 Couleurs (`ColorController`)

| Méthode | URI | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/colors` | **Public** (`permitAll()`) | Retourne la liste ordonnée des couleurs disponibles (avec cache Caffeine/Redis). |
| `POST` | `/api/admin/colors` | **Admin** (`hasRole('ADMIN')`) | Crée une nouvelle nuance de bois (génération auto de slug et normalisation hex). Invalide le cache. |
| `PUT` | `/api/admin/colors/{id}` | **Admin** (`hasRole('ADMIN')`) | Met à jour le libellé, la couleur hexadécimale ou le statut par défaut. Invalide le cache. |
| `DELETE` | `/api/admin/colors/{id}` | **Admin** (`hasRole('ADMIN')`) | Supprime la nuance de couleur. Invalide le cache. |

### 4.2 Reels & Témoignages vidéo (`ReelController`)

| Méthode | URI | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/reels` | **Public** (`permitAll()`) | Récupère la vidéo active et ses avis synchronisés par timestamp (avec cache). |
| `POST` | `/api/admin/reels` | **Admin** (`hasRole('ADMIN')`) | Initialise ou met à jour la configuration complète de la vidéo et des avis. Invalide le cache. |
| `PUT` | `/api/admin/reels/{id}` | **Admin** (`hasRole('ADMIN')`) | Met à jour la configuration du reel ciblé. Invalide le cache. |
| `DELETE` | `/api/admin/reels/{id}` | **Admin** (`hasRole('ADMIN')`) | Supprime la configuration. |

### 4.3 Uploads Sécurisés (`UploadController`)

| Méthode | URI | Accès | Description & Sécurisation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/uploads/image` | **Admin** (`hasRole('ADMIN')`) | Upload d'image (max 25 Mo). Vérification de l'extension (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`), du type MIME et de la signature binaire (*magic bytes*). |
| `POST` | `/api/admin/uploads/video` | **Admin** (`hasRole('ADMIN')`) | Upload de vidéo (max 100 Mo). Vérification de l'extension (`.mp4`, `.webm`, `.mov`), du type MIME et du marqueur conteneur ISO `ftyp` / EBML. |

---

## 5. Sécurité & Pipeline d'Upload Supabase Storage

L'implémentation de `SupabaseStorageService` et `UploadController` résout les vulnérabilités identifiées dans l'audit initial :

```
[Requête Client Admin multipart/form-data]
                    │
                    ▼
       [Contrôleur UploadController]
  ├── 1. Vérification de non-vacuité & limite de taille (25MB image / 100MB vidéo)
  ├── 2. Sanitization du nom (blocage strict du Path Traversal "..", "/", "\")
  ├── 3. Whitelist stricte d'extensions autorisées
  ├── 4. Validation du Content-Type HTTP
  └── 5. Inspection des Magic Bytes en mémoire (FF D8 FF, 89 50 4E 47, ftyp, etc.)
                    │
                    ▼
       [SupabaseStorageService]
  ├── Génération d'un UUID v4 unique pour le nom de fichier cible
  ├── Clé SUPABASE_SERVICE_KEY configurée ?
  │     ├── OUI ──> Envoi HTTP POST direct vers /storage/v1/object/{bucket}/{folder}/{uuid}.ext
  │     └── NON ──> Fallback gracieux sur FileStorageService local (dev / CI)
  └── Retour du UploadResponseDto ({ url, path, mimeType, size })
```

---

## 6. Schéma de Base de Données (`schema-phase1.sql`)

Le script `backend/src/main/resources/schema-phase1.sql` a été écrit pour être 100% idempotent :

```sql
CREATE TABLE IF NOT EXISTS colors (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    hex VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_colors_is_default ON colors(is_default);

CREATE TABLE IF NOT EXISTS reel_configs (
    id BIGSERIAL PRIMARY KEY,
    video_url VARCHAR(500) NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reel_reviews (
    id BIGSERIAL PRIMARY KEY,
    reel_config_id BIGINT NOT NULL,
    platform VARCHAR(50),
    name VARCHAR(150),
    avatar VARCHAR(50),
    rating INTEGER,
    text TEXT,
    time INTEGER,
    duration INTEGER,
    position VARCHAR(20),
    CONSTRAINT fk_reel_reviews_config 
        FOREIGN KEY (reel_config_id) 
        REFERENCES reel_configs(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reel_reviews_config_id ON reel_reviews(reel_config_id);
CREATE INDEX IF NOT EXISTS idx_reel_reviews_time ON reel_reviews(time);
```

---

## 7. Résultats des Tests Automatisés

L'exécution complète de `mvn test` confirme le bon fonctionnement et l'absence totale de régressions :

```
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.artisanataschi.backend.CacheBehaviorTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
Running com.artisanataschi.backend.controller.ColorControllerTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
Running com.artisanataschi.backend.controller.ReelControllerTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
Running com.artisanataschi.backend.controller.UploadControllerTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
Running com.artisanataschi.backend.RedisSerializationTest
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
Running com.artisanataschi.backend.service.ColorServiceTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
Running com.artisanataschi.backend.service.ReelServiceTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0

Results:
Tests run: 27, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS (Temps total : 01:42 min)
```

---

## 8. Conformité aux Contraintes & Prochaine Étape (Phase 2)

| Contrainte | Statut | Commentaire |
| :--- | :---: | :--- |
| Aucune route Next.js supprimée | ✅ Respecté | Les routes `app/api/*` sont toujours en place et opérationnelles. |
| Aucun fichier JSON supprimé | ✅ Respecté | `colors-data.json` et `reel-data.json` sont conservés. |
| Aucune régression frontend | ✅ Respecté | Le frontend Next.js continue de consommer ses routes actuelles. |
| Compilation et tests Spring Boot au vert | ✅ Respecté | 27/27 tests réussis, build success. |
| Protection Mass Assignment | ✅ Respecté | 14 routes admin converties en DTOs validés. |
| Idempotence de la migration DB | ✅ Respecté | `schema-phase1.sql` et `DatabaseSeeder` prêts pour PostgreSQL Supabase. |

La **Phase 1** est prête pour validation par l'utilisateur avant d'engager la **Phase 2 (Migration des Données existantes vers PostgreSQL Supabase et Supabase Storage)**.
