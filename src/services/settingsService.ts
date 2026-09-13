import { apiClient } from './apiClient';

export interface SettingsProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
  status?: string;
}

export interface SettingsProfileInput {
  username?: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

export const settingsService = {
  async getProfile(id: number): Promise<SettingsProfile> {
    const { data } = await apiClient.get<SettingsProfile>(`/users/${id}`);
    return data;
  },

  async updateProfile(id: number, payload: SettingsProfileInput): Promise<SettingsProfile> {
    const { data } = await apiClient.put<SettingsProfile>(`/users/${id}`, payload);
    return data;
  },
};