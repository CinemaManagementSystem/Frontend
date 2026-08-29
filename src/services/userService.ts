import { apiClient } from './apiClient';
import { User, UserInput } from '@/types/user';

export const userService = {
  async list(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  async create(payload: UserInput): Promise<User> {
    const { data } = await apiClient.post<User>('/users', payload);
    return data;
  },

  async update(id: number, payload: UserInput): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};