import http from 'k6/http';
import { check, sleep, group } from 'k6';

// ============================================================================
// CONFIGURATION DU TEST DE CHARGE K6
// ============================================================================
export const options = {
  // Scénario de montée en charge progressive (Ramping VUs)
  stages: [
    { duration: '30s', target: 5 },   // Échauffement : montée à 5 utilisateurs
    { duration: '1m',  target: 15 },  // Charge normale : 15 utilisateurs simultanés
    { duration: '30s', target: 25 },  // Pic de charge : 25 utilisateurs simultanés
    { duration: '30s', target: 0 },   // Redescente à 0 utilisateur
  ],

  // Critères de succès / échec (SLA)
  thresholds: {
    // 95% des requêtes doivent répondre en moins de 2.5 secondes (avec hébergement cloud gratuit)
    http_req_duration: ['p(95)<2500'],
    // Moins de 2% d'erreurs tolérées sur tout le test
    http_req_failed: ['rate<0.02'],
  },
};

// URLs cibles (modifiables via variable d'environnement k6 -e FRONTEND_URL=...)
const FRONTEND_URL = __ENV.FRONTEND_URL || 'https://artisanat-aschi.vercel.app';
const BACKEND_URL = __ENV.BACKEND_URL || 'https://artisanat-aschi-backend.onrender.com/api';

export default function () {
  // 1. Test du Frontend sur Vercel (Visiteur qui navigue)
  group('1. Frontend Navigation', function () {
    // Page d'accueil
    const homeRes = http.get(FRONTEND_URL, {
      tags: { my_tag: 'HomePage' },
    });
    check(homeRes, {
      'Frontend Home: statut 200': (r) => r.status === 200,
    });

    sleep(1);

    // Page Catalogue
    const catalogRes = http.get(`${FRONTEND_URL}/catalogue`, {
      tags: { my_tag: 'CataloguePage' },
    });
    check(catalogRes, {
      'Frontend Catalogue: statut 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  // 2. Test des API Backend sur Render (Données dynamiques)
  group('2. Backend REST API', function () {
    // Liste des catégories
    const catRes = http.get(`${BACKEND_URL}/public/categories`, {
      tags: { my_tag: 'ApiCategories' },
    });
    check(catRes, {
      'API Categories: statut 200': (r) => r.status === 200,
      'API Categories: réponse < 2s': (r) => r.timings.duration < 2000,
    });

    // Liste des produits
    const prodRes = http.get(`${BACKEND_URL}/public/products`, {
      tags: { my_tag: 'ApiProducts' },
    });
    check(prodRes, {
      'API Products: statut 200': (r) => r.status === 200,
      'API Products: contenu JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    });

    // Section livraisons
    const delivRes = http.get(`${BACKEND_URL}/public/deliveries`, {
      tags: { my_tag: 'ApiDeliveries' },
    });
    check(delivRes, {
      'API Deliveries: statut 200': (r) => r.status === 200,
    });

    // Le backend limite /public/** à 180 requêtes/minute par IP (RateLimitingFilter.java).
    // Depuis une seule machine, un test trop intense déclenche des 429 : c'est la protection, pas une panne.
    check([catRes, prodRes, delivRes], {
      'API: pas bloqué par le rate limit (429)': (arr) => arr.every((r) => r.status !== 429),
    });
  });

  // Pause réaliste entre deux actions utilisateur (1 à 3 secondes)
  sleep(2);
}
