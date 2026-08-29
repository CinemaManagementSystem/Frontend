import { apiClient } from './apiClient';
import { Screen, ScreenInput } from '@/types/screen';

export const screenService = {
  async list(): Promise<Screen[]> {
    const { data } = await apiClient.get<Screen[]>('/screens');
    return data;
  },

  async getById(id: number): Promise<Screen> {
    const { data } = await apiClient.get<Screen>(`/screens/${id}`);
    return data;
  },

  async create(payload: ScreenInput): Promise<Screen> {
    const { data } = await apiClient.post<Screen>('/screens', payload);
    return data;
  },

  async update(id: number, payload: ScreenInput): Promise<Screen> {
    const { data } = await apiClient.put<Screen>(`/screens/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/screens/${id}`);
  },
};