import { apiClient } from './apiClient';
import { Location, LocationInput } from '@/types/location';

export const locationService = {
  async list(): Promise<Location[]> {
    const { data } = await apiClient.get<Location[]>('/locations');
    return data;
  },

  async getById(id: number): Promise<Location> {
    const { data } = await apiClient.get<Location>(`/locations/${id}`);
    return data;
  },

  async create(payload: LocationInput): Promise<Location> {
    const { data } = await apiClient.post<Location>('/locations', payload);
    return data;
  },

  async update(id: number, payload: LocationInput): Promise<Location> {
    const { data } = await apiClient.put<Location>(`/locations/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};