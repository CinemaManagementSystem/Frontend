import { apiClient } from './apiClient';
import { Show, ShowInput } from '@/types/show';

export const showService = {
  async list(): Promise<Show[]> {
    const { data } = await apiClient.get<Show[]>('/shows');
    return data;
  },

  async getById(id: number): Promise<Show> {
    const { data } = await apiClient.get<Show>(`/shows/${id}`);
    return data;
  },

  async create(payload: ShowInput): Promise<Show> {
    const { data } = await apiClient.post<Show>('/shows', payload);
    return data;
  },

  async update(id: number, payload: ShowInput): Promise<Show> {
    const { data } = await apiClient.put<Show>(`/shows/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/shows/${id}`);
  },
};