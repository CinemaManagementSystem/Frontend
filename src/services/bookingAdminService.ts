import { apiClient } from './apiClient';
import { ApiBooking, ApiBookingInput } from '@/types/bookingApi';

export const bookingAdminService = {
  async list(): Promise<ApiBooking[]> {
    const { data } = await apiClient.get<ApiBooking[]>('/bookings');
    return data;
  },

  async getById(id: number): Promise<ApiBooking> {
    const { data } = await apiClient.get<ApiBooking>(`/bookings/${id}`);
    return data;
  },

  async create(payload: ApiBookingInput): Promise<ApiBooking> {
    const { data } = await apiClient.post<ApiBooking>('/bookings', payload);
    return data;
  },

  async update(id: number, payload: ApiBookingInput): Promise<ApiBooking> {
    const { data } = await apiClient.put<ApiBooking>(`/bookings/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  },
};