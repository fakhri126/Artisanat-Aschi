export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

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
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  details: string;
  imageUrl: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdDate: string;
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
  imageUrls: string[];
}

// --- Auth Helper ---

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
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
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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

// --- Public Endpoints ---

export const publicApi = {
  getProducts: (params?: { category?: string; color?: string; dimensions?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    const queryString = query.toString();
    return fetchApi<Product[]>(`/public/products${queryString ? '?' + queryString : ''}`);
  },
  
  getFeaturedProducts: () => {
    return fetchApi<Product[]>('/public/products/featured');
  },
  
  getProductById: (id: number) => {
    return fetchApi<Product>(`/public/products/${id}`);
  },
  
  getCategories: () => {
    return fetchApi<Category[]>('/public/categories');
  },
  
  getProjects: (category?: string) => {
    return fetchApi<Project[]>(`/public/projects${category ? '?category=' + encodeURIComponent(category) : ''}`);
  },
  
  getNews: () => {
    return fetchApi<News[]>('/public/news');
  },
  
  getReferences: () => {
    return fetchApi<Reference[]>('/public/references');
  },
  
  getTestimonials: () => {
    return fetchApi<Testimonial[]>('/public/testimonials');
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
};

// --- Admin Endpoints ---

export const adminApi = {
  login: (credentials: { username: string; password: String }) => {
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

  // Categories CRUD
  getCategories: () => fetchApi<Category[]>('/public/categories'),
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
  getProducts: () => fetchApi<Product[]>('/public/products'),
  createProduct: (data: ProductRequest) => fetchApi<Product>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id: number, data: ProductRequest) => fetchApi<Product>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id: number) => fetchApi<void>(`/admin/products/${id}`, {
    method: 'DELETE',
  }),

  // Projects CRUD
  getProjects: () => fetchApi<Project[]>('/public/projects'),
  createProject: (data: Omit<Project, 'id'>) => fetchApi<Project>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id: number, data: Omit<Project, 'id'>) => fetchApi<Project>(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
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
};
