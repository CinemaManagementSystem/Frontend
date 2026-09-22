import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';
import type { AuthResponse } from '@/types/auth';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
const PUBLIC_GET_PATHS = [
  '/movies',
  '/shows',
  '/locations',
  '/theaters',
  '/movie-category',
  '/memberships/plans',
];
export const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '/api';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { Accept: 'application/json' },
});

const getRequestPath = (url?: string): string => {
  if (!url) return '';
  try {
    return new URL(url, apiClient.defaults.baseURL || window.location.origin).pathname;
  } catch {
    return url.split('?')[0].split('#')[0];
  }
};

const isPublicAuthRequest = (url?: string): boolean => {
  const path = getRequestPath(url).replace(/\/$/, '');
  return PUBLIC_AUTH_PATHS.some((publicPath) => path === publicPath || path.endsWith(publicPath));
};

const isPublicBrowsingRequest = (config?: Pick<InternalAxiosRequestConfig, 'method' | 'url'>): boolean => {
  if (!config?.url || (config.method ?? 'get').toLowerCase() !== 'get') return false;
  const path = getRequestPath(config.url).replace(/\/$/, '');
  return PUBLIC_GET_PATHS.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`));
};

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const unwrapApiResponse = <T>(value: T | ApiResponse<T>): T => {
  if (isRecord(value) && typeof value.success === 'boolean' && 'data' in value) {
    return value.data as T;
  }
  return value as T;
};

const clearPersistedAuth = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

const notifyAuthExpired = () => {
  clearPersistedAuth();
  window.dispatchEvent(new Event('cinematique:auth-expired'));
};

let refreshPromise: Promise<AuthResponse> | null = null;

const refreshAccessToken = async (): Promise<AuthResponse> => {
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('Missing refresh token');

  refreshPromise ??= axios
    .post<AuthResponse | ApiResponse<AuthResponse>>(
      `${apiBaseUrl.replace(/\/$/, '')}/auth/refresh`,
      { refreshToken },
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
    )
    .then((response) => unwrapApiResponse(response.data))
    .then((response) => {
      window.localStorage.setItem(TOKEN_KEY, response.accessToken);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      return response;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isPublicAuthRequest(config.url) && !isPublicBrowsingRequest(config) && typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrapApiResponse(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url) &&
      !isPublicBrowsingRequest(originalRequest)
    ) {
      try {
        originalRequest._retry = true;
        const refreshed = await refreshAccessToken();
        originalRequest.headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
        return apiClient(originalRequest as AxiosRequestConfig);
      } catch {
        notifyAuthExpired();
      }
    }
    return Promise.reject(error);
  },
);

const getPayloadMessage = (payload: unknown): string | undefined => {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (!isRecord(payload)) return undefined;
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  if (Array.isArray(payload.errors)) {
    const messages = payload.errors.filter((item): item is string => typeof item === 'string');
    if (messages.length) return messages.join(', ');
  }
  return undefined;
};

export const getApiErrorMessage = (error: unknown, operation = 'request'): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = getPayloadMessage(error.response?.data);
    if (responseMessage) return responseMessage;
    if (error.response?.status === 429) {
      return `The ${operation} service is temporarily busy. Please wait a moment and try again.`;
    }
    if (error.code === 'ERR_CANCELED') return 'Request was cancelled.';
    if (!error.response) {
      return `Unable to connect to the API. Make sure the backend is running at ${apiBaseUrl}.`;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return `Unable to complete ${operation}. Please try again.`;
};

export { apiClient };
