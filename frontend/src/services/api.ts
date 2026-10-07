/**
 * Centralized API client for CineSense
 * Handles base URL, auth headers, JSON parsing, and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'cinesense_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // Handle 401 — session expired or unauthorized
  if (response.status === 401) {
    removeToken();
    // Dispatch a custom event so auth context can react
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = new Error(
      data?.error || data?.errors?.general || 'An unexpected error occurred.'
    );
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: import('../types').User;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: payload, auth: false }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: payload, auth: false }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ user: import('../types').User }>('/api/auth/me'),
};

// ── Analyze endpoint ─────────────────────────────────────────────────────────

export const analyzeApi = {
  analyze: (reviewText: string, movieName?: string, signal?: AbortSignal) =>
    request<import('../types').AnalysisResult>('/api/analyze', {
      method: 'POST',
      body: { reviewText: reviewText, movieName: movieName || '' },
      signal,
    }),
};

// ── Reviews endpoints ────────────────────────────────────────────────────────

export interface ReviewsFilters {
  sentiment?: string;
  sort?: 'newest' | 'oldest';
  search?: string;
}

export const reviewsApi = {
  getAll: (filters: ReviewsFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.sentiment) params.set('sentiment', filters.sentiment);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ reviews: import('../types').Review[] }>(`/api/reviews${qs}`);
  },

  delete: (id: number) =>
    request(`/api/reviews/${id}`, { method: 'DELETE' }),

  getOne: (id: number) =>
    request<{ review: import('../types').Review }>(`/api/reviews/${id}`),
};

// ── Stats endpoint ───────────────────────────────────────────────────────────

export const statsApi = {
  get: () => request<import('../types').Stats>('/api/stats'),
};

// ── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<{ status: string }>('/api/health', { auth: false }),
};

export default { authApi, analyzeApi, reviewsApi, statsApi, healthApi };
