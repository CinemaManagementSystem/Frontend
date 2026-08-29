import { apiClient } from './apiClient';
import { BookingSeat, BookingSeatInput } from '@/types/bookingSeat';

export const bookingSeatService = {
  async list(): Promise<BookingSeat[]> {
    const { data } = await apiClient.get<BookingSeat[]>('/booking-seats');
    return data;
  },

  async getById(id: number): Promise<BookingSeat> {
    const { data } = await apiClient.get<BookingSeat>(`/booking-seats/${id}`);
    return data;
  },

  async create(payload: BookingSeatInput): Promise<BookingSeat> {
    const { data } = await apiClient.post<BookingSeat>('/booking-seats', payload);
    return data;
  },

  async update(id: number, payload: BookingSeatInput): Promise<BookingSeat> {
    const { data } = await apiClient.put<BookingSeat>(`/booking-seats/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/booking-seats/${id}`);
  },
};