import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Métriques personnalisées pour isoler les vitesses
const trendFrontend = new Trend('frontend_duration', true);
const trendBackend = new Trend('backend_api_duration', true);
const trendMedia = new Trend('media_download_duration', true);
const counterBytes = new Counter('total_media_bytes');

export const options = {
  // Concurrence calibrée (6 VUs max) pour rester sous le Rate Limiting du backend (180 req/min/IP)
  stages: [
    { duration: '20s', target: 3 },  // Montée à 3 utilisateurs
    { duration: '45s', target: 6 },  // 6 utilisateurs simultanés
    { duration: '15s', target: 0 },  // Redescente
  ],
  thresholds: {
    'frontend_duration': ['p(95)<1500'], // Pages Vercel < 1.5s
    'backend_api_duration': ['p(95)<1500'], // API Render < 1.5s
    'http_req_failed': ['rate<0.02'], // Moins de 2% d'erreurs
  },
};

const FRONTEND_URL = 'https://artisanat-aschi.vercel.app';
const BACKEND_URL = 'https://artisanat-aschi-backend.onrender.com/api';

export default function () {
  // 1. Navigation Pages Vercel
  group('1. Frontend Pages', function () {
    const homeRes = http.get(FRONTEND_URL);
    trendFrontend.add(homeRes.timings.duration);
    check(homeRes, {
      'Home: statut 200': (r) => r.status === 200,
    });

    sleep(1);

    const catalogRes = http.get(`${FRONTEND_URL}/catalogue`);
    trendFrontend.add(catalogRes.timings.duration);
    check(catalogRes, {
      'Catalogue: statut 200': (r) => r.status === 200,
    });
  });

  sleep(1.5);

  // 2. API Backend Render (Catégories + Produits + Livraisons)
  group('2. Backend Data', function () {
    const catRes = http.get(`${BACKEND_URL}/public/categories`);
    trendBackend.add(catRes.timings.duration);

    const prodRes = http.get(`${BACKEND_URL}/public/products`);
    trendBackend.add(prodRes.timings.duration);

    const delivRes = http.get(`${BACKEND_URL}/public/deliveries`);
    trendBackend.add(delivRes.timings.duration);

    check([catRes, prodRes, delivRes], {
      'API: statut 200': (arr) => arr.every(r => r.status === 200),
      'API: pas de blocage 429': (arr) => arr.every(r => r.status !== 429),
    });
  });

  sleep(1.5);

  // 3. Test de Téléchargement des Médias (Photos & Vidéos)
  group('3. Médias & Vidéos', function () {
    // A. Téléchargement d'une image Supabase CDN
    const imgRes = http.get('https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/object/public/media/1791095826710-IMG_20230930_092350.webp');
    trendMedia.add(imgRes.timings.duration);
    counterBytes.add(imgRes.body ? imgRes.body.length : 0);
    check(imgRes, {
      'Image Supabase: 200': (r) => r.status === 200,
    });

    // B. Téléchargement d'un segment vidéo MP4 hébergé sur Vercel (avec Range request comme un vrai lecteur vidéo)
    const videoRes = http.get(`${FRONTEND_URL}/video-media-aschi.mp4`, {
      headers: {
        'Range': 'bytes=0-1048576', // Premier 1 Mo de la vidéo (buffer initial)
      },
    });
    trendMedia.add(videoRes.timings.duration);
    counterBytes.add(videoRes.body ? videoRes.body.length : 0);
    check(videoRes, {
      'Vidéo Vercel (1er Mo): statut 200 ou 206': (r) => r.status === 200 || r.status === 206,
    });
  });

  sleep(2);
}
