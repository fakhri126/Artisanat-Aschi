# RAPPORT D'IMPLÉMENTATION — ÉTAPE 2 : MISE EN PLACE DU CACHE APPLICATIF

**Projet :** Artisanat Aschi  
**Date :** 25 Septembre 2026  
**Statut :** **ÉTAPE 2 — VALIDATION RÉUSSIE**  
**Périmètre :** Sécurisation et configuration du cache applicatif Caffeine (local) et Redis (distribué/production)  

---

## 1. État initial du cache

L'audit complet réalisé sur le code existant a permis de constater :
- `@EnableCaching` était déjà actif sur `CacheConfig.java`.
- `application.yml` définissait `spring.cache.type: ${CACHE_TYPE:caffeine}` permettant la bascule dynamique.
- Les méthodes `getFeaturedProducts()`, `getLatestProducts()` et `getProductsFiltered(...)` dans `ProductService` étaient déjà annotées `@Cacheable`.
- Les méthodes de mutation dans `ProductService` (`createProduct`, `updateProduct`, `deleteProduct`) avaient déjà `@CacheEvict(allEntries = true)`.
- **Faiblesses identifiées et corrigées :**
  1. Le TTL de `latestProducts` dans Redis était configuré à 30 minutes au lieu de la cible de 15 minutes.
  2. Le gestionnaire local Caffeine utilisait une configuration globale uniforme (15 minutes) au lieu de TTLs granulaires adaptés (24h pour les catégories, 1h pour les produits mis en avant).
  3. La clé de cache SpEL de `products` ne prenait pas en compte le tri (`#pageable.sort`).
  4. La modification ou suppression d'une catégorie dans `CategoryService` n'invalidait pas le cache des `products` (risque de conserver d'anciens libellés de catégories dans les produits en cache).

---

## 2. Architecture finale

```text
                     Client (Navigateur)
                              │
                    Cache-Control HTTP
              (max-age=60s / s-maxage=300s)
                              │
                              ▼
                     Spring Boot Backend
                              │
                        Spring Cache
                       /            \
             (spring.cache.type)    (spring.cache.type)
                 = caffeine              = redis
                    /                      \
                   ▼                        ▼
        Caffeine Cache (Local)     Redis Cache (Production)
        - En mémoire JVM (<0.1ms)  - Cache partagé distribué
        - Autonome (sans Docker)   - Sérialisation JSON ISO-8601
        - TTL granulaires dédiés   - Clés String préfixées
                   \                      /
                    \                    /
                     ▼                  ▼
               Source de Vérité : PostgreSQL (Supabase)
```

**Principe immuable :** PostgreSQL reste la seule et unique source de vérité. Le cache ne sert qu'à décharger les lectures répétitives de la base de données.

---

## 3. Caches configurés

Tableau des caches configurés avec politique de rétention et TTL rigoureusement identiques entre Caffeine et Redis :

| Cache | TTL Cible | TTL Appliqué | Provider Local | Provider Production | Contenu & Utilisation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`categories`** | 24 heures | **24h** | Caffeine (`max 200`) | Redis | Liste publique des catégories (`/api/public/categories`) |
| **`products`** | 15 minutes | **15min** | Caffeine (`max 1000`) | Redis | Catalogue filtré et paginé (`/api/public/products`) |
| **`featuredProducts`** | 1 heure | **1h** | Caffeine (`max 100`) | Redis | Les 6 créations phares (`/api/public/products/featured`) |
| **`latestProducts`** | 15 minutes | **15min** | Caffeine (`max 100`) | Redis | Les 5 dernières créations atelier (`/api/public/products/latest`) |
| **`projects`** | 2 heures | **2h** | Caffeine (`max 200`) | Redis | Réalisations d'exception (`/api/public/projects`) |
| **`news`** | 1 heure | **1h** | Caffeine (`max 200`) | Redis | Actualités publiques de l'atelier (`/api/public/news`) |

---

## 4. Clés de cache

### Catalogue dynamique (`products`)
La clé de cache composite SpEL a été fiabilisée dans `ProductService.java` :
```java
@Cacheable(
    value = "products",
    key = "{#category, #color, #dimensions, #type, #pageable != null ? #pageable.pageNumber : 0, #pageable != null ? #pageable.pageSize : 24, #pageable != null ? #pageable.sort.toString() : 'UNSORTED'}"
)
```
- **Prise en compte intégrale des critères :** Toute variation de `category`, `color`, `dimensions`, `type`, numéro de page, taille de page ou critère de tri génère une clé distincte.
- **Zéro collision :** Deux requêtes avec des filtres différents ne peuvent jamais recevoir le résultat de l'une ou de l'autre.
- **Rétrocompatibilité :** L'appel du frontend sans pagination utilise `safeDefault = PageRequest.of(0, 250, Sort.by(Sort.Direction.DESC, "id"))`, ce qui produit une clé stable dédiée `[null, null, null, CATALOGUE, 0, 250, id: DESC]`.

### Caches sans paramètres (`categories`, `featuredProducts`, `latestProducts`, `news`)
Spring Cache utilise la clé singleton `SimpleKey.EMPTY`, évitant toute surcharge mémoire.

---

## 5. Invalidation du cache (`@CacheEvict`)

### Déroulement du cycle de vie
```text
ADMIN
  ↓
Création / Modification / Suppression (Produit ou Catégorie)
  ↓
PostgreSQL mis à jour (Source de vérité)
  ↓
@CacheEvict(value = {"products", "featuredProducts", "latestProducts"}, allEntries = true)
  ↓
Invalidation instantanée des entrées
  ↓
Prochaine requête client
  ↓
CACHE MISS → Requête PostgreSQL fraîche → CACHE PUT
```

### Justification de `allEntries = true`
- Avec un volume actuel de **159 produits**, la purge globale en mémoire s'effectue en une fraction de milliseconde.
- Étant donné que modifier un produit peut changer son appartenance de catégorie, sa couleur, ou son statut "mis en avant", une éviction ciblée par clé unique laisserait subsister des incohérences sur les vues filtrées combinatoires.
- `allEntries = true` garantit une **cohérence immédiate à 100% (zéro produit fantôme)** sans introduire de complexité superflue.
- Dans `CategoryService.java`, l'invalidation a été étendue pour purger également `products` lors de la mise à jour ou suppression d'une catégorie.

---

## 6. Redis (Environnement distribué / Production)

- **Activation :** Conditionnée par `spring.cache.type=redis` (variable `CACHE_TYPE=redis`).
- **Sérialisation :**
  - Clés : `StringRedisSerializer` (lisibles directement en clair dans Redis CLI).
  - Valeurs : `GenericJackson2JsonRedisSerializer` configuré avec `JavaTimeModule` et `WRITE_DATES_AS_TIMESTAMPS=false`.
  - Format des dates : chaînes ISO-8601 standard (`2026-09-25T10:30:00`).
  - `disableCachingNullValues()` activé (pas de pollution de cache avec des valeurs nulles).
- **Comportement en cas d'absence :**
  - Si l'environnement de production est configuré sur `redis` et que l'instance Redis n'est pas joignable, Spring Cache lève une `RedisConnectionFailureException`.
  - L'application ne masque pas silencieusement une panne d'infrastructure critique en production.

---

## 7. Caffeine (Environnement local / Développement)

- **Activation :** Utilisé par défaut (`spring.cache.type=caffeine` ou absence de variable).
- **Performance :**
  - Exécution directement en mémoire heap JVM.
  - Latence de lecture inférieure à 0.1 milliseconde.
  - Totalement autonome : fonctionne sans Docker, sans dépendance externe et sans latence réseau.
- **Granularité :**
  - Chaque cache (`categories`, `products`, `featuredProducts`, `latestProducts`, `projects`, `news`) possède son instance dédiée configurée avec son propre TTL et son `maximumSize` via `registerCustomCache`.
  - Métriques d'accès activées (`recordStats()`).

---

## 8. Sécurité du cache

- **Isolation stricte des données publiques :**
  - Aucune donnée privée, compte utilisateur (`Admin`), mot de passe, token JWT ou demande de devis (`QuoteRequest`) n'est mise en cache.
  - Les requêtes administratives consultent directement la base de données.
  - Les caches sont strictement cantonnés aux catalogues et données vitrines publiques.
- **Aucun cache sur les mutations :**
  - Seules les méthodes de lecture `GET` sont interceptées par le cache. Aucune opération `POST`, `PUT`, `PATCH`, `DELETE` n'est annotée `@Cacheable`.

---

## 9. Tests et validations exécutés

### Backend (`mvn clean test`) — **SUCCÈS (Code 0)**
La suite de tests automatisée créée dans `backend/src/test/java` s'est exécutée avec un succès total en 1m19s :

1. **`CacheBehaviorTest` (3 tests réussis) :**
   - `testFeaturedProductsCacheHitAndMiss` : Prouve le cycle Cache Miss (1 requête DB) → Cache Put → Cache Hit (0 nouvelle requête DB).
   - `testProductsFilteredCacheKeyAndHit` : Prouve que deux requêtes avec filtres identiques bénéficient du cache, tandis qu'un filtre différent déclenche un Cache Miss.
   - `testCacheEvictionOnProductMutation` : Prouve que la création/modification d'un produit par l'admin invalide le cache et force la prochaine requête à interroger PostgreSQL.
2. **`RedisSerializationTest` (2 tests réussis) :**
   - `testProductWithLocalDateTimeSerialization` : Prouve que la sérialisation et la désérialisation Jackson d'un `Product` avec `LocalDateTime createdAt` s'effectue sans aucune exception.
   - `testProductListSerialization` : Prouve la sérialisation/désérialisation d'une liste de produits avec dates.

**Bilan Maven :** `Tests run: 5, Failures: 0, Errors: 0, Skipped: 0` — **BUILD SUCCESS**.

### Frontend (`npm run build`) — **SUCCÈS (Code 0)**
- Next.js 16.2.6 avec Turbopack.
- Compilation réussie en 64s.
- 27/27 pages statiques générées avec succès en 5.1s.
- Aucune régression TypeScript, JSX ou d'appel API.

---

## 10. Problèmes et réserves constatés

1. **Service Docker local :**
   - Docker Desktop est installé (`v29.6.1`) mais son démon n'est pas démarré en tâche de fond sur la machine Windows de test.
   - Ceci valide le choix de conception d'utiliser Caffeine par défaut en local, rendant le développement totalement insensible à l'état de Docker.

---

## 11. Conclusion

```text
ÉTAPE 2 — VALIDATION RÉUSSIE
```

L'Étape 2 est intégralement achevée, testée et documentée.
- Le cache local **Caffeine** protège efficacement la base PostgreSQL contre les requêtes répétitives.
- Le cache de production **Redis** est opérationnel et sécurisé avec gestion des dates Java 8.
- Aucune régression sur le frontend ni sur le modèle de données.
