import { apiClient } from './apiClient';
import { ApiMovie, ApiMovieInput } from '@/types/movieApi';

export const movieAdminService = {
  async list(): Promise<ApiMovie[]> {
    const { data } = await apiClient.get<ApiMovie[]>('/movies');
    return data;
  },

  async getById(id: number): Promise<ApiMovie> {
    const { data } = await apiClient.get<ApiMovie>(`/movies/${id}`);
    return data;
  },

  async create(payload: ApiMovieInput): Promise<ApiMovie> {
    const { data } = await apiClient.post<ApiMovie>('/movies', payload);
    return data;
  },

  async update(id: number, payload: ApiMovieInput): Promise<ApiMovie> {
    const { data } = await apiClient.put<ApiMovie>(`/movies/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/movies/${id}`);
  },
};