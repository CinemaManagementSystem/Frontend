import { apiClient } from './apiClient';
import { Order, OrderInput } from '@/types/order';

export const orderService = {
  async list(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },

  async getById(id: number): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },

  async create(payload: OrderInput): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
  },

  async update(id: number, payload: OrderInput): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/orders/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};