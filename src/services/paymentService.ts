import { apiClient } from './apiClient';
import { Payment, PaymentInput } from '@/types/payment';

export interface VerifyKhqrInput {
  paymentId: number;
  qr: string;
  md5: string;
}

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

  async verifyKhqr(payload: VerifyKhqrInput): Promise<Payment> {
    const { data } = await apiClient.post<Payment>('/payments/verify-khqr', payload, { timeout: 15_000 });
    return data;
  },

  async switchToCash(id: number): Promise<Payment> {
    const { data } = await apiClient.post<Payment>(`/payments/${id}/switch-to-cash`, undefined, { timeout: 20_000 });
    return data;
  },

  async prepareKhqr(id: number, payload: { qr: string; md5: string; expectedMd5: string }): Promise<Payment> {
    const { data } = await apiClient.post<Payment>(`/payments/${id}/prepare-khqr`, payload, { timeout: 15_000 });
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  },
};
