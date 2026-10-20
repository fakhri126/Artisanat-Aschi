function ensureApiSuffix(url: string): string {
  const clean = url.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export function getApiBaseUrl(): string {
  // 1. Variable explicitement définie et non-localhost
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return ensureApiSuffix(process.env.NEXT_PUBLIC_API_URL);
  }
  // 2. Détection dynamique dans le navigateur en production (Render ou autre domaine)
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://artisanat-aschi-backend.onrender.com/api';
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      if (publicUrl && !publicUrl.includes('localhost')) {
        return ensureApiSuffix(publicUrl);
      }
      return 'https://artisanat-aschi-backend.onrender.com/api';
    }
  }
  // 3. Fallback production côté serveur (SSR Node.js)
  if (process.env.NODE_ENV === 'production') {
    const internalUrl = process.env.INTERNAL_BACKEND_URL;
    if (internalUrl && !internalUrl.includes('localhost')) return ensureApiSuffix(internalUrl);
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;
    if (publicUrl && !publicUrl.includes('localhost')) return ensureApiSuffix(publicUrl);
    return 'https://artisanat-aschi-backend.onrender.com/api';
  }
  // 4. Fallback développement local
  return ensureApiSuffix(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api');
}

import { AUTHENTIC_PROJECTS } from '@/app/espaces-d-exception/constants';
import { convertToWebP } from '@/lib/image-compression';
import {
  getAdaptiveRequestTimeoutMs,
  nowMs,
  recordLaunchRequest,
} from '@/lib/launch-metrics';

export const API_BASE_URL = getApiBaseUrl();

// --- Type Definitions ---

export interface Category {
  id: number;
  name: string;
  type: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  colorLabel: string | null; // null = no variant, 'Original' = real photo, other = IA variant name
}

export interface Product {
  id: number;
  name: string;
  description: string;
  dimensions: string;
  materials: string;
  color: string;
  price: number | null;
  availability: string;
  type: 'PIECE_UNIQUE' | 'REPRODUCTIBLE' | 'CATALOGUE';
  isFeatured: boolean;
  category: Category;
  images: ProductImage[];
  style?: string;
  createdAt?: string;
  createdDate?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  details: string;
  imageUrl: string;
  gallery?: string[] | string;
  images?: string[];
  videoUrl?: string | null;
  video?: string | null;
  materials?: string | null;
  review?: any;
}

export interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdDate: string;
}

export interface Relooking {
  id: number;
  title: string;
  description: string;
  imageAvantUrl: string;
  imageApresUrl: string;
  category: string;
  createdDate: string;
}

export interface Delivery {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  deliveryDate: string;
  location?: string;
  clientReview?: string;
}

export interface Reference {
  id: number;
  name: string;
  logoUrl: string;
  siteUrl: string;
}

export interface Testimonial {
  id: number;
  clientName: string;
  clientRole: string;
  content: string;
  videoUrl: string | null;
  imageUrl: string | null;
  type: 'TEXT' | 'VIDEO';
}

export interface QuoteRequest {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  product: Product | null;
  personalizationDetails: string | null;
  message: string;
  createdDate: string;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED';
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

export interface ImageVariant {
  imageUrl: string;
  colorLabel: string | null; // 'Original' | 'Bleu Cérusé' | 'Doré' | etc.
}

export interface ProductRequest {
  name: string;
  description: string;
  categoryId: number;
  dimensions: string;
  materials: string;
  color: string;
  price: number | null;
  availability: string;
  type: 'PIECE_UNIQUE' | 'REPRODUCTIBLE' | 'CATALOGUE';
  isFeatured: boolean;
  style?: string;
  imageUrls?: string[];         // legacy fallback
  imageVariants?: ImageVariant[]; // new: structured variants with colorLabel
}

// --- Auth Helper ---

export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const cleanToken = decodeURIComponent(token).replace(/^Bearer\s+/i, '').trim();
    const parts = cleanToken.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonStr = typeof window !== 'undefined'
      ? decodeURIComponent(
          atob(padded)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      : Buffer.from(padded, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);
    if (payload.exp && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return true;
  }
}

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]).trim() : null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined' && token) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    localStorage.setItem('token', cleanToken);
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `admin_token=${cleanToken}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const storageToken = localStorage.getItem('token');
    const cookieToken = getCookieToken();
    const token = storageToken || cookieToken;

    if (!token) return null;
    if (isTokenExpired(token)) {
      removeAuthToken();
      return null;
    }
    // Garantir la synchronisation permanente entre localStorage et le cookie lu par middleware.ts
    if (!storageToken || !cookieToken || storageToken !== cookieToken) {
      setAuthToken(token);
    }
    return token;
  }
  return null;
}

export function isLoggedIn(): boolean {
  return getAuthToken() !== null;
}

// --- Client-side in-memory cache + in-flight deduplication for public GET requests ---
const publicApiCache = new Map<string, { timestamp: number; data: any }>();
const inFlightPublicGet = new Map<string, Promise<any>>();
const PUBLIC_CACHE_TTL_MS = 60 * 1000;

export function invalidatePublicApiCache() {
  publicApiCache.clear();
  inFlightPublicGet.clear();
}

export function seedPublicApiCache(endpoint: string, data: any, timestamp: number = Date.now()) {
  if (data !== undefined && data !== null) {
    publicApiCache.set(endpoint, { timestamp, data });
  }
}

async function fetchWithAdaptiveTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs?: number): Promise<Response> {
  if (init.signal) {
    return fetch(input, init);
  }
  const ms = timeoutMs ?? getAdaptiveRequestTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- API Helper Fetcher ---

let localBackendUnreachable = false;

async function executeFetchApiNetwork<T>(
  endpoint: string,
  options: RequestInit,
  token: string | null,
  method: string,
  isPublicGet: boolean
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  // Set Content-Type only when sending a body (POST, PUT, PATCH)
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || (options.body && !(options.body instanceof FormData))) {
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
  }
  
  // Attach token only for protected endpoints (never for /public/ or /auth/)
  const isPublicOrAuth = endpoint.startsWith('/public/') || endpoint.startsWith('/auth/');
  if (token && !isPublicOrAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };
  if (!fetchOptions.cache && (token || options.method === 'DELETE' || options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    fetchOptions.cache = 'no-store';
  }

  const baseUrl = getApiBaseUrl();
  const isLocalBase = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  let response: Response;

  // Si le backend local (port 8081) est déjà détecté comme éteint, passer directement par le proxy Next.js /backend-api
  if (typeof window !== 'undefined' && isLocalBase && localBackendUnreachable && !endpoint.startsWith('/api/')) {
    response = await fetchWithAdaptiveTimeout(`/backend-api${endpoint}`, fetchOptions);
  } else {
    try {
      // Sur localhost, utiliser un timeout court (1200ms) pour basculer rapidement vers /backend-api si le port 8081 est fermé
      const primaryTimeout = isLocalBase ? 1200 : getAdaptiveRequestTimeoutMs();
      response = await fetchWithAdaptiveTimeout(`${baseUrl}${endpoint}`, fetchOptions, primaryTimeout);
    } catch (networkErr: any) {
      if (isLocalBase) {
        localBackendUnreachable = true;
      }
      // If browser direct call fails (e.g. local backend off, CORS, cold start), fallback to local Next.js rewrite /backend-api
      if (typeof window !== 'undefined' && !baseUrl.startsWith('/backend-api') && !endpoint.startsWith('/api/')) {
        try {
          console.warn(`[API] Retrying via Next.js proxy (/backend-api${endpoint}):`, networkErr);
          response = await fetchWithAdaptiveTimeout(`/backend-api${endpoint}`, fetchOptions);
        } catch {
          throw networkErr;
        }
      } else {
        throw networkErr;
      }
    }
  }

  // Also fallback if status is 5xx (e.g. gateway error during spin-up)
  if (!response.ok && response.status >= 500 && typeof window !== 'undefined' && !baseUrl.startsWith('/backend-api') && !endpoint.startsWith('/api/')) {
    try {
      console.warn(`[API] Server returned ${response.status}, retrying via Next.js proxy (/backend-api${endpoint})`);
      const fallbackRes = await fetchWithAdaptiveTimeout(`/backend-api${endpoint}`, fetchOptions);
      if (fallbackRes.ok) {
        response = fallbackRes;
      }
    } catch {}
  }

  if (response.status === 401 || response.status === 403) {
    let errMsg = endpoint.startsWith('/auth/')
      ? "Identifiants invalides (nom d'utilisateur ou mot de passe incorrect)."
      : 'Non autorisé. Veuillez vous connecter.';
    try {
      const errJson = await response.clone().json();
      if (errJson?.error) errMsg = errJson.error;
    } catch {}

    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login') && !endpoint.startsWith('/auth/')) {
      removeAuthToken();
      window.location.href = '/admin/login';
    }
    throw new Error(errMsg);
  }

  if (!response.ok) {
    const errorText = await response.text();
    // Nettoyer les réponses HTML brutes (Tomcat 404, passerelle 502/503 Render)
    if (errorText.trim().startsWith('<')) {
      if (response.status === 404) {
        throw new Error("Ressource ou point d'accès introuvable sur le serveur (Erreur 404).");
      }
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error("Le serveur sécurisé démarre ou est temporairement indisponible. Veuillez patienter.");
      }
      throw new Error(`Le serveur a renvoyé une erreur (${response.status}).`);
    }
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.error) throw new Error(parsed.error);
    } catch (e: any) {
      if (e instanceof Error && e.message && !e.message.includes('JSON')) {
        throw e;
      }
    }
    throw new Error(errorText || `Erreur HTTP: ${response.status}`);
  }

  // Handle empty or empty JSON response
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return {} as T;
  }

  const result = await response.json() as T;
  if (isPublicGet && typeof window !== 'undefined') {
    publicApiCache.set(endpoint, { timestamp: Date.now(), data: result });
  }

  return result;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const method = (options.method || 'GET').toUpperCase();
  const start = nowMs();

  // If this is a mutation, clear client-side public cache
  if (method !== 'GET') {
    invalidatePublicApiCache();
  }

  // Check cache for public GET requests without token
  const isPublicGet = method === 'GET' && !token && endpoint.startsWith('/public/') && options.cache !== 'no-store';
  if (isPublicGet && typeof window !== 'undefined') {
    const cached = publicApiCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < PUBLIC_CACHE_TTL_MS) {
      const end = nowMs();
      recordLaunchRequest({
        endpoint,
        initiator: 'fetchApi:cache',
        startTimeMs: start,
        endTimeMs: end,
        durationMs: end - start,
        source: 'memory-cache',
        status: 'ok',
        parallelGroup: true,
      });
      return cached.data as T;
    }

    // In-flight deduplication: if the exact same GET endpoint is already in flight, share its Promise!
    const existingPromise = inFlightPublicGet.get(endpoint);
    if (existingPromise) {
      return existingPromise.then((res) => {
        const end = nowMs();
        recordLaunchRequest({
          endpoint,
          initiator: 'fetchApi:dedup',
          startTimeMs: start,
          endTimeMs: end,
          durationMs: end - start,
          source: 'in-flight-dedup',
          status: 'ok',
          parallelGroup: true,
        });
        return res as T;
      });
    }
  }

  const requestPromise = executeFetchApiNetwork<T>(endpoint, options, token, method, isPublicGet)
    .then((res) => {
      const end = nowMs();
      if (method === 'GET') {
        recordLaunchRequest({
          endpoint,
          initiator: 'fetchApi:network',
          startTimeMs: start,
          endTimeMs: end,
          durationMs: end - start,
          source: 'network',
          status: 'ok',
          parallelGroup: true,
        });
      }
      return res;
    })
    .catch((err) => {
      const end = nowMs();
      if (method === 'GET') {
        const isTimeout =
          err?.name === 'AbortError' ||
          err?.name === 'TimeoutError' ||
          String(err?.message || '').toLowerCase().includes('timeout');
        recordLaunchRequest({
          endpoint,
          initiator: 'fetchApi:network',
          startTimeMs: start,
          endTimeMs: end,
          durationMs: end - start,
          source: 'fallback',
          status: isTimeout ? 'timeout' : 'error',
          parallelGroup: true,
        });
      }
      // Stale-if-error fallback from publicApiCache if available on weak connections
      if (isPublicGet && typeof window !== 'undefined') {
        const stale = publicApiCache.get(endpoint);
        if (stale && stale.data) {
          return stale.data as T;
        }
      }
      throw err;
    })
    .finally(() => {
      if (isPublicGet) {
        inFlightPublicGet.delete(endpoint);
      }
    });

  if (isPublicGet && typeof window !== 'undefined') {
    inFlightPublicGet.set(endpoint, requestPromise);
  }

  return requestPromise;
}

export function parseProduct(product: Product): Product {
  if (!product) return product;

  const anyProd = product as any;
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    if (Array.isArray(anyProd.imageUrls) && anyProd.imageUrls.length > 0) {
      product.images = anyProd.imageUrls.map((url: string, idx: number) => ({
        id: idx,
        imageUrl: url,
        isPrimary: idx === 0,
        colorLabel: 'Original',
      }));
    } else if (anyProd.imageUrl) {
      product.images = [{
        id: 0,
        imageUrl: anyProd.imageUrl,
        isPrimary: true,
        colorLabel: 'Original',
      }];
    } else {
      product.images = [];
    }
  }

  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map((img: any, idx: number) => {
      if (typeof img === 'string') {
        let url = img;
        let colorLabel: string | null = 'Original';
        if (url.includes('#color=')) {
          const [u, colorPart] = url.split('#color=');
          url = u;
          colorLabel = decodeURIComponent(colorPart);
        }
        return { id: idx, imageUrl: url, isPrimary: idx === 0, colorLabel };
      }

      if (img && img.imageUrl && img.imageUrl.includes('#color=')) {
        const [url, colorPart] = img.imageUrl.split('#color=');
        return { ...img, imageUrl: url, colorLabel: decodeURIComponent(colorPart) };
      }
      return img;
    });
  }
  return product;
}

// --- Public Endpoints ---

export const publicApi = {
  getProducts: (params?: { category?: string; color?: string; dimensions?: string; type?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) query.append(key, String(val));
      });
    }
    const queryString = query.toString();
    return fetchApi<any>(`/public/products${queryString ? '?' + queryString : ''}`)
      .then(res => {
        const items: Product[] = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : []);
        return items.map(parseProduct);
      });
  },
  
  getFeaturedProducts: () => {
    return fetchApi<any>('/public/products/featured')
      .then(res => {
        const items: Product[] = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : []);
        return items.map(parseProduct);
      });
  },
  
  getProductById: (id: number) => {
    return fetchApi<Product>(`/public/products/${id}`)
      .then(parseProduct);
  },
  
  getLatestProducts: () => {
    return fetchApi<any>('/public/products/latest')
      .then(res => {
        const items: Product[] = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : []);
        return items.map(parseProduct);
      });
  },
  
  getCategories: async () => {
    try {
      return await fetchApi<Category[]>('/public/categories');
    } catch {
      return [];
    }
  },
  
  getProjects: async (category?: string) => {
    try {
      const res = await fetchApi<Project[]>(`/public/projects${category ? '?category=' + encodeURIComponent(category) : ''}`);
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
      return AUTHENTIC_PROJECTS as unknown as Project[];
    } catch {
      return AUTHENTIC_PROJECTS as unknown as Project[];
    }
  },
  
  getNews: async () => {
    try {
      return await fetchApi<News[]>('/public/news');
    } catch {
      return [];
    }
  },

  getRelookings: async () => {
    try {
      return await fetchApi<Relooking[]>('/public/relookings');
    } catch {
      return [];
    }
  },

  getReferences: async () => {
    try {
      return await fetchApi<Reference[]>('/public/references');
    } catch {
      return [];
    }
  },
  
  getTestimonials: async () => {
    try {
      return await fetchApi<Testimonial[]>('/public/testimonials');
    } catch {
      return [];
    }
  },
  
  submitQuoteRequest: (data: {
    fullName: string;
    phoneNumber: string;
    email: string;
    productId?: number;
    personalizationDetails?: string;
    message: string;
  }) => {
    return fetchApi<QuoteRequest>('/public/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDeliveries: async () => {
    try {
      return await fetchApi<Delivery[]>('/public/deliveries');
    } catch {
      return [];
    }
  },

  getVideos: async (): Promise<any> => {
    const endpoint = '/api/videos';
    const start = nowMs();

    if (typeof window !== 'undefined') {
      const cached = publicApiCache.get(endpoint);
      if (cached && Date.now() - cached.timestamp < PUBLIC_CACHE_TTL_MS) {
        const end = nowMs();
        recordLaunchRequest({
          endpoint,
          initiator: 'publicApi.getVideos:cache',
          startTimeMs: start,
          endTimeMs: end,
          durationMs: end - start,
          source: 'memory-cache',
          status: 'ok',
          parallelGroup: true,
        });
        return cached.data;
      }

      const existing = inFlightPublicGet.get(endpoint);
      if (existing) {
        return existing.then((data) => {
          const end = nowMs();
          recordLaunchRequest({
            endpoint,
            initiator: 'publicApi.getVideos:dedup',
            startTimeMs: start,
            endTimeMs: end,
            durationMs: end - start,
            source: 'in-flight-dedup',
            status: 'ok',
            parallelGroup: true,
          });
          return data;
        });
      }
    }

    const p = fetchWithAdaptiveTimeout(endpoint)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const end = nowMs();
        if (typeof window !== 'undefined') {
          publicApiCache.set(endpoint, { timestamp: Date.now(), data });
        }
        recordLaunchRequest({
          endpoint,
          initiator: 'publicApi.getVideos:network',
          startTimeMs: start,
          endTimeMs: end,
          durationMs: end - start,
          source: 'network',
          status: 'ok',
          parallelGroup: true,
        });
        return data;
      })
      .catch((err) => {
        const end = nowMs();
        recordLaunchRequest({
          endpoint,
          initiator: 'publicApi.getVideos:network',
          startTimeMs: start,
          endTimeMs: end,
          durationMs: end - start,
          source: 'fallback',
          status: 'error',
          parallelGroup: true,
        });
        if (typeof window !== 'undefined') {
          const stale = publicApiCache.get(endpoint);
          if (stale?.data) return stale.data;
        }
        return null;
      })
      .finally(() => {
        inFlightPublicGet.delete(endpoint);
      });

    if (typeof window !== 'undefined') {
      inFlightPublicGet.set(endpoint, p);
    }

    return p;
  },
};

function formatProductVariants(data: ProductRequest): void {
  if (data.imageVariants && data.imageVariants.length > 0) {
    data.imageUrls = data.imageVariants.map(v => `${v.imageUrl}#color=${encodeURIComponent(v.colorLabel || 'Original')}`);
  }
}

// --- Admin Endpoints ---

export const adminApi = {
  login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
    const cleanCredentials = {
      username: (credentials.username || '').trim(),
      password: credentials.password || '',
    };

    // 1. Authentification directe et instantanée via la route Next.js (/api/auth/login -> Supabase PostgreSQL + JWT HS384 compatible Spring Boot)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanCredentials),
        cache: 'no-store',
      });

      if (res.ok) {
        const data = (await res.json()) as LoginResponse;
        if (data?.token) {
          setAuthToken(data.token);
          return data;
        }
      } else if (res.status === 401 || res.status === 400) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Identifiants invalides (nom d'utilisateur ou mot de passe incorrect).");
      }
    } catch (err: any) {
      if (err?.message?.includes('Identifiants invalides') || err?.message?.includes('requis')) {
        throw err;
      }
      console.warn('[Auth] Fallback vers backend /auth/login:', err);
    }

    // 2. Fallback vers le backend Spring Boot (/auth/login)
    const res = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(cleanCredentials),
    });
    setAuthToken(res.token);
    return res;
  },

  getStats: () => {
    return fetchApi<any>('/admin/stats');
  },

  uploadImage: async (file: File) => {
    // 0. Automatically compress and convert any image to WebP before sending to server
    let fileToUpload = file;
    try {
      fileToUpload = await convertToWebP(file);
    } catch (e) {
      console.warn('WebP conversion fallback to original file:', e);
    }

    // 1. Direct reliable upload via Next.js API route
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          // If pointing to localhost / local backend, normalize to relative path;
          // keep full Supabase CDN or external URLs intact
          const cleanUrl = json.url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+(?:\/api)?/, '');
          return { url: cleanUrl };
        }
      }
    } catch (e) {
      console.warn('Next.js direct upload fallback:', e);
    }

    // 2. Fallback to Spring Boot backend /admin/uploads/image
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const backendRes = await fetchApi<{ url: string }>('/admin/uploads/image', {
      method: 'POST',
      body: formData,
    });
    const cleanUrl = backendRes.url
      ? backendRes.url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+(?:\/api)?/, '')
      : backendRes.url;
    return { url: cleanUrl };
  },

  uploadVideo: async (file: File) => {
    try {
      // Prioritize Next.js /api/upload-video (with FFmpeg compression and +faststart)
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        return (await res.json()) as { url: string };
      }
      const err = await res.json().catch(() => ({}));
      console.warn('Next.js upload-video returned error:', err);
    } catch (e) {
      console.warn('Next.js upload-video failed, falling back to direct upload:', e);
    }

    // Fallback: direct backend upload to Spring Boot /admin/uploads/video
    const formData = new FormData();
    formData.append('file', file);
    const backendRes = await fetchApi<{ url: string }>('/admin/uploads/video', {
      method: 'POST',
      body: formData,
    });
    const cleanUrl = backendRes.url
      ? backendRes.url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+(?:\/api)?/, '')
      : backendRes.url;
    return { url: cleanUrl };
  },

  uploadProductImage: (file: File) => {
    return adminApi.uploadImage(file);
  },

  // Categories CRUD
  getCategories: () => fetchApi<Category[]>('/public/categories', { cache: 'no-store' }),
  createCategory: (data: Omit<Category, 'id'>) => fetchApi<Category>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCategory: (id: number, data: Omit<Category, 'id'>) => fetchApi<Category>(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCategory: (id: number) => fetchApi<void>(`/admin/categories/${id}`, {
    method: 'DELETE',
  }),

  // Products CRUD
  getProducts: () => fetchApi<any>('/public/products', { cache: 'no-store' }).then(res => {
    const items: Product[] = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : []);
    return items.map(parseProduct);
  }),
  createProduct: (data: ProductRequest) => {
    formatProductVariants(data);
    return fetchApi<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(parseProduct);
  },
  updateProduct: (id: number, data: ProductRequest) => {
    formatProductVariants(data);
    return fetchApi<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(parseProduct);
  },
  deleteProduct: (id: number) => fetchApi<void>(`/admin/products/${id}`, {
    method: 'DELETE',
  }),

  // Projects CRUD
  getProjects: () => fetchApi<Project[]>('/public/projects'),
  createProject: (data: Omit<Project, 'id'>) => {
    const { title, description, category, location, details, imageUrl, videoUrl, video } = data as any;
    const cleanData = {
      title: title || '',
      description: description || '',
      category: category || 'hotel',
      location: location || '',
      details: details || '',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || video || ''
    };
    return fetchApi<Project>('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  },
  updateProject: (id: number, data: Omit<Project, 'id'>) => {
    const { title, description, category, location, details, imageUrl, videoUrl, video } = data as any;
    const cleanData = {
      title: title || '',
      description: description || '',
      category: category || 'hotel',
      location: location || '',
      details: details || '',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || video || ''
    };
    return fetchApi<Project>(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteProject: (id: number) => fetchApi<void>(`/admin/projects/${id}`, {
    method: 'DELETE',
  }),

  // News CRUD
  getNews: () => fetchApi<News[]>('/public/news'),
  createNews: (data: Omit<News, 'id' | 'createdDate'>) => fetchApi<News>('/admin/news', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateNews: (id: number, data: Omit<News, 'id' | 'createdDate'>) => fetchApi<News>(`/admin/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteNews: (id: number) => fetchApi<void>(`/admin/news/${id}`, {
    method: 'DELETE',
  }),

  // --- Relookings ---
  getRelookings: async () => {
    try {
      const res = await fetch(`/api/relookings?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (_) {}
    return fetchApi<Relooking[]>(`/public/relookings?_t=${Date.now()}`, { cache: 'no-store' });
  },
  createRelooking: async (data: Omit<Relooking, 'id' | 'createdDate'>) => {
    try {
      const res = await fetch('/api/relookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Also asynchronously forward to Spring Boot backend if available
          fetchApi<Relooking>('/admin/relookings', {
            method: 'POST',
            body: JSON.stringify(data),
          }).catch(() => {});
          return json.data;
        }
      }
    } catch (_) {}
    return fetchApi<Relooking>('/admin/relookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateRelooking: async (id: number, data: Omit<Relooking, 'id' | 'createdDate'>) => {
    try {
      const res = await fetch('/api/relookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          fetchApi<Relooking>(`/admin/relookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          }).catch(() => {});
          return json.data;
        }
      }
    } catch (_) {}
    return fetchApi<Relooking>(`/admin/relookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteRelooking: async (id: number) => {
    try {
      await fetch(`/api/relookings?id=${id}`, { method: 'DELETE' });
    } catch (_) {}
    return fetchApi<void>(`/admin/relookings/${id}`, {
      method: 'DELETE',
    });
  },

  // References CRUD
  getReferences: () => fetchApi<Reference[]>('/public/references'),
  createReference: (data: Omit<Reference, 'id'>) => fetchApi<Reference>('/admin/references', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateReference: (id: number, data: Omit<Reference, 'id'>) => fetchApi<Reference>(`/admin/references/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteReference: (id: number) => fetchApi<void>(`/admin/references/${id}`, {
    method: 'DELETE',
  }),

  // Testimonials CRUD
  getTestimonials: () => fetchApi<Testimonial[]>('/public/testimonials'),
  createTestimonial: (data: Omit<Testimonial, 'id'>) => fetchApi<Testimonial>('/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTestimonial: (id: number, data: Omit<Testimonial, 'id'>) => fetchApi<Testimonial>(`/admin/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTestimonial: (id: number) => fetchApi<void>(`/admin/testimonials/${id}`, {
    method: 'DELETE',
  }),

  // Quote Requests Management
  getQuotes: () => fetchApi<QuoteRequest[]>('/admin/quotes'),
  updateQuoteStatus: (id: number, status: string) => fetchApi<QuoteRequest>(`/admin/quotes/${id}/status?status=${status}`, {
    method: 'PATCH',
  }),
  deleteQuoteRequest: (id: number) => fetchApi<void>(`/admin/quotes/${id}`, {
    method: 'DELETE',
  }),
  deleteQuote: (id: number) => fetchApi<void>(`/admin/quotes/${id}`, {
    method: 'DELETE',
  }),

  // --- Deliveries ---
  getDeliveries: () => fetchApi<Delivery[]>('/public/deliveries'),
  createDelivery: (data: Omit<Delivery, 'id'>) => fetchApi<Delivery>('/admin/deliveries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDelivery: (id: number, data: Omit<Delivery, 'id'>) => fetchApi<Delivery>(`/admin/deliveries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteDelivery: (id: number) => fetchApi<void>(`/admin/deliveries/${id}`, {
    method: 'DELETE',
  }),
};

// --- Color Swatches Management ---
export interface ColorSwatch {
  id: string;
  label: string;
  name: string;
  hex: string;
  isDefault?: boolean;
}

export const colorsApi = {
  getColors: async (): Promise<ColorSwatch[]> => {
    try {
      const res = await fetch('/api/colors', { cache: 'no-store' });
      if (res.ok) {
        const raw = await res.json();
        return raw.map((c: any) => ({
          id: c.id,
          label: c.label || c.name || '',
          name: c.name || c.label || '',
          hex: c.hex,
          isDefault: c.isDefault,
        }));
      }
    } catch (e) {
      console.warn('Fallback getting colors:', e);
    }
    return [
      { id: 'blanc', label: 'Blanc', name: 'Blanc', hex: '#FFFFFF', isDefault: true },
      { id: 'noir', label: 'Noir', name: 'Noir', hex: '#1A1A1A', isDefault: true },
      { id: 'noyer', label: 'Noyer', name: 'Noyer', hex: '#5C3317', isDefault: true },
      { id: 'bleu', label: 'Bleu', name: 'Bleu', hex: '#2D5F8A', isDefault: true },
      { id: 'or', label: 'Or', name: 'Or', hex: '#C9A84C', isDefault: true },
      { id: 'naturel', label: 'Naturel', name: 'Naturel', hex: '#C4A882', isDefault: true },
      { id: 'vert-olivier', label: 'Vert Olivier', name: 'Vert Olivier', hex: '#4A5E3A', isDefault: true },
      { id: 'bordeaux', label: 'Bordeaux', name: 'Bordeaux', hex: '#7B2D3E', isDefault: true },
    ];
  },

  createColor: async (data: { label: string; hex: string }): Promise<ColorSwatch> => {
    const res = await fetch('/api/colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la création de la couleur');
    }
    return await res.json();
  },

  updateColor: async (id: string, data: { label: string; hex: string }): Promise<ColorSwatch> => {
    const res = await fetch('/api/colors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la mise à jour de la couleur');
    }
    return await res.json();
  },

  deleteColor: async (id: string): Promise<void> => {
    const res = await fetch(`/api/colors?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la suppression de la couleur');
    }
  },
};
