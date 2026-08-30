import { apiClient } from './apiClient';
import { Seat, SeatInput } from '@/types/seat';

export const seatService = {
  async list(): Promise<Seat[]> {
    const { data } = await apiClient.get<Seat[]>('/seats');
    return data;
  },

  async getById(id: number): Promise<Seat> {
    const { data } = await apiClient.get<Seat>(`/seats/${id}`);
    return data;
  },

  async create(payload: SeatInput): Promise<Seat> {
    const { data } = await apiClient.post<Seat>('/seats', payload);
    return data;
  },

  async update(id: number, payload: SeatInput): Promise<Seat> {
    const { data } = await apiClient.put<Seat>(`/seats/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/seats/${id}`);
  },
};