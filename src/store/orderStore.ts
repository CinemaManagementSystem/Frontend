import { create } from 'zustand';
import { Order, OrderInput } from '@/types/order';
import { orderService } from '@/services/orderService';

interface OrderState {
  orders: Order[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: OrderInput) => Promise<void>;
  update: (id: number, payload: OrderInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const orders = await orderService.list();
      set({ orders });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await orderService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await orderService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await orderService.remove(id);
    await get().fetchAll();
  },
}));