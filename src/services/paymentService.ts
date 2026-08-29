import { apiClient } from './apiClient';
import { Payment, PaymentInput } from '@/types/payment';

export const paymentService = {
  async list(): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>('/payments');
    return data;
  },

  async getById(id: number): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${id}`);
    return data;
  },

  async create(payload: PaymentInput): Promise<Payment> {
    const { data } = await apiClient.post<Payment>('/payments', payload);
    return data;
  },

  async update(id: number, payload: PaymentInput): Promise<Payment> {
    const { data } = await apiClient.put<Payment>(`/payments/${id}`, payload);
    return data;
  },

  async confirm(id: number): Promise<Payment> {
    const { data } = await apiClient.post<Payment>(`/payments/${id}/confirm`);
    return data;
  },

  async checkStatus(id: number): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${id}/status`);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  },
};