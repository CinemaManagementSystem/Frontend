import { apiClient } from './apiClient';
import { AuthResponse, RegisterResponse } from '@/types/auth';

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload);
    return data;
  },

  async logout(): Promise<void> {
    // Best-effort server-side token revocation; the local session is always
    // cleared afterwards by authStore.logout/logoutAsync regardless of outcome.
    await apiClient
      .post('/auth/logout')
      .catch(() => undefined);
  },
};