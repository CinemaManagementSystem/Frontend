import { apiClient } from './apiClient';
import { MovieCategory, MovieCategoryInput } from '@/types/category';

export const categoryService = {
  async list(): Promise<MovieCategory[]> {
    const { data } = await apiClient.get<MovieCategory[]>('/movie-category');
    return data;
  },

  async getById(id: number): Promise<MovieCategory> {
    const { data } = await apiClient.get<MovieCategory>(`/movie-category/${id}`);
    return data;
  },

  async create(payload: MovieCategoryInput): Promise<MovieCategory> {
    const { data } = await apiClient.post<MovieCategory>('/movie-category', payload);
    return data;
  },

  async update(id: number, payload: MovieCategoryInput): Promise<MovieCategory> {
    const { data } = await apiClient.put<MovieCategory>(`/movie-category/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/movie-category/${id}`);
  },
};