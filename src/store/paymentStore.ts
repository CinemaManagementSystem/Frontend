import { create } from 'zustand';
import { Payment, PaymentInput } from '@/types/payment';
import { paymentService } from '@/services/paymentService';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: PaymentInput) => Promise<void>;
  update: (id: number, payload: PaymentInput) => Promise<void>;
  confirm: (id: number) => Promise<void>;
  checkStatus: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const payments = await paymentService.list();
      set({ payments });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await paymentService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await paymentService.update(id, payload);
    await get().fetchAll();
  },

  confirm: async (id) => {
    await paymentService.confirm(id);
    await get().fetchAll();
  },

  checkStatus: async (id) => {
    await paymentService.checkStatus(id);
    await get().fetchAll();
  },

  remove: async (id) => {
    await paymentService.remove(id);
    await get().fetchAll();
  },
}));