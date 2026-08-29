import { apiClient } from './apiClient';
import { PaymentTransaction, PaymentTransactionInput } from '@/types/paymentTransaction';

export const paymentTransactionService = {
  async list(): Promise<PaymentTransaction[]> {
    const { data } = await apiClient.get<PaymentTransaction[]>('/payment-transactions');
    return data;
  },

  async getById(id: number): Promise<PaymentTransaction> {
    const { data } = await apiClient.get<PaymentTransaction>(`/payment-transactions/${id}`);
    return data;
  },

  async listByPayment(paymentId: number): Promise<PaymentTransaction[]> {
    const { data } = await apiClient.get<PaymentTransaction[]>(`/payment-transactions/by-payment/${paymentId}`);
    return data;
  },

  async create(payload: PaymentTransactionInput): Promise<PaymentTransaction> {
    const { data } = await apiClient.post<PaymentTransaction>('/payment-transactions', payload);
    return data;
  },

  async update(id: number, payload: PaymentTransactionInput): Promise<PaymentTransaction> {
    const { data } = await apiClient.put<PaymentTransaction>(`/payment-transactions/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/payment-transactions/${id}`);
  },
};