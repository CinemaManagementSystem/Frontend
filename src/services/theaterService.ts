import { apiClient } from './apiClient';
import { Theater, TheaterInput } from '@/types/theater';

export const theaterService = {
  async list(): Promise<Theater[]> {
    const { data } = await apiClient.get<Theater[]>('/theaters');
    return data;
  },

  async getById(id: number): Promise<Theater> {
    const { data } = await apiClient.get<Theater>(`/theaters/${id}`);
    return data;
  },

  async create(payload: TheaterInput): Promise<Theater> {
    const { data } = await apiClient.post<Theater>('/theaters', payload);
    return data;
  },

  async update(id: number, payload: TheaterInput): Promise<Theater> {
    const { data } = await apiClient.put<Theater>(`/theaters/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/theaters/${id}`);
  },
};