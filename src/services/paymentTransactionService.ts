import { apiClient } from './apiClient';
import { PaymentTransaction, PaymentTransactionInput, PaymentTransactionPage } from '@/types/paymentTransaction';
import type { PaymentStatus } from '@/types/payment';

export const paymentTransactionService = {
  async list(): Promise<PaymentTransaction[]> {
    const { data } = await apiClient.get<PaymentTransaction[]>('/payment-transactions');
    return data;
  },

  async listPage(params: {
    page?: number;
    size?: number;
    status?: PaymentStatus | 'ALL';
    sort?: string;
  } = {}): Promise<PaymentTransactionPage> {
    const { data } = await apiClient.get<PaymentTransactionPage>('/payment-transactions/page', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        status: params.status && params.status !== 'ALL' ? params.status : undefined,
        sort: params.sort ?? 'id,desc',
      },
    });
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
