import { apiClient } from './apiClient';
import { OrderItem, OrderItemInput } from '@/types/orderItem';

export const orderItemService = {
  async list(): Promise<OrderItem[]> {
    const { data } = await apiClient.get<OrderItem[]>('/order-items');
    return data;
  },

  async getById(id: number): Promise<OrderItem> {
    const { data } = await apiClient.get<OrderItem>(`/order-items/${id}`);
    return data;
  },

  async create(payload: OrderItemInput): Promise<OrderItem> {
    const { data } = await apiClient.post<OrderItem>('/order-items', payload);
    return data;
  },

  async update(id: number, payload: OrderItemInput): Promise<OrderItem> {
    const { data } = await apiClient.put<OrderItem>(`/order-items/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/order-items/${id}`);
  },
};