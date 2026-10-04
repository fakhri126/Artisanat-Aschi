export function getApiBaseUrl(): string {
  // 1. Variable explicitement définie et non-localhost
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  // 2. Détection dynamique dans le navigateur en production (Render ou autre domaine)
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://artisanat-aschi-backend.onrender.com/api';
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return (process.env.NEXT_PUBLIC_API_URL || 'https://artisanat-aschi-backend.onrender.com/api').replace(/\/+$/, '');
    }
  }
  // 3. Fallback développement local
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api').replace(/\/+$/, '');
}

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
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = typeof window !== 'undefined'
      ? decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      : Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);
    if (payload.exp && typeof payload.exp === 'number') {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return true;
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) return null;
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function isLoggedIn(): boolean {
  return getAuthToken() !== null;
}

// --- API Helper Fetcher ---

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
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
  const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      removeAuthToken();
      window.location.href = '/admin/login';
    }
    throw new Error('Non autorisé. Veuillez vous connecter.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erreur HTTP: ${response.status}`);
  }

  // Handle empty or empty JSON response
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return {} as T;
  }

  return response.json() as Promise<T>;
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
  
  getCategories: () => {
    return fetchApi<Category[]>('/public/categories');
  },
  
  getProjects: (category?: string) => {
    return fetchApi<Project[]>(`/public/projects${category ? '?category=' + encodeURIComponent(category) : ''}`);
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
};

function formatProductVariants(data: ProductRequest): void {
  if (data.imageVariants && data.imageVariants.length > 0) {
    data.imageUrls = data.imageVariants.map(v => `${v.imageUrl}#color=${encodeURIComponent(v.colorLabel || 'Original')}`);
  }
}

// --- Admin Endpoints ---

export const adminApi = {
  login: (credentials: { username: string; password: string }) => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }).then((res) => {
      setAuthToken(res.token);
      return res;
    });
  },

  getStats: () => {
    return fetchApi<any>('/admin/stats');
  },

  uploadImage: async (file: File) => {
    // 1. Direct reliable upload via Next.js API route
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          const cleanUrl = json.url.replace(/^https?:\/\/[^/]+(?:\/api)?/, '');
          return { url: cleanUrl };
        }
      }
    } catch (e) {
      console.warn('Next.js direct upload fallback:', e);
    }

    // 2. Fallback to Spring Boot backend /admin/upload
    const formData = new FormData();
    formData.append('file', file);
    const backendRes = await fetchApi<{ url: string }>('/admin/upload', {
      method: 'POST',
      body: formData,
    });
    const cleanUrl = backendRes.url ? backendRes.url.replace(/^https?:\/\/[^/]+(?:\/api)?/, '') : backendRes.url;
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

    // Fallback: direct backend upload
    return await adminApi.uploadImage(file);
  },

  uploadProductImage: (file: File) => {
    return adminApi.uploadImage(file);
  },

  // Categories CRUD
  getCategories: () => fetchApi<Category[]>(`/public/categories?_t=${Date.now()}`, { cache: 'no-store' }),
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
  getProducts: () => fetchApi<any>(`/public/products?_t=${Date.now()}`, { cache: 'no-store' }).then(res => {
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
      imageUrl: imageUrl || '/project-hotel.png',
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
      imageUrl: imageUrl || '/project-hotel.png',
      videoUrl: videoUrl || video || ''
    };
    return fetchApi<Project>(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData),
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
  getRelookings: () => fetchApi<Relooking[]>('/public/relookings'),
  createRelooking: (data: Omit<Relooking, 'id' | 'createdDate'>) => fetchApi<Relooking>('/admin/relookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRelooking: (id: number, data: Omit<Relooking, 'id' | 'createdDate'>) => fetchApi<Relooking>(`/admin/relookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRelooking: (id: number) => fetchApi<void>(`/admin/relookings/${id}`, {
    method: 'DELETE',
  }),

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

