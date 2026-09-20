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
    const { posterFile, ...fields } = payload;
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, String(value ?? '')));
    if (posterFile) form.append('poster', posterFile);
    const { data } = await apiClient.post<ApiMovie>('/movies', form);
    return data;
  },

  async update(id: number, payload: ApiMovieInput): Promise<ApiMovie> {
    const { posterFile, ...fields } = payload;
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, String(value ?? '')));
    if (posterFile) form.append('poster', posterFile);
    const { data } = await apiClient.put<ApiMovie>(`/movies/${id}`, form);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/movies/${id}`);
  },
};
