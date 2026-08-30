import { create } from 'zustand';
import { OrderItem, OrderItemInput } from '@/types/orderItem';
import { orderItemService } from '@/services/orderItemService';

interface OrderItemState {
  orderItems: OrderItem[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: OrderItemInput) => Promise<void>;
  update: (id: number, payload: OrderItemInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useOrderItemStore = create<OrderItemState>((set, get) => ({
  orderItems: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const orderItems = await orderItemService.list();
      set({ orderItems });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await orderItemService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await orderItemService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await orderItemService.remove(id);
    await get().fetchAll();
  },
}));