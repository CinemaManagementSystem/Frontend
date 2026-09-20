import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user';
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const unwrapApiResponse = <T>(value: T | ApiResponse<T>): T => {
  if (isRecord(value) && typeof value.success === 'boolean' && 'data' in value) {
    return value.data as T;
  }
  return value as T;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isPublicAuthRequest(config.url) && typeof window !== 'undefined') {
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
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !isPublicAuthRequest(error.config?.url)
    ) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?redirect=${encodeURIComponent(returnTo)}`);
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
