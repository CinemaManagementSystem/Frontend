import { create } from 'zustand';
import { PaymentTransaction, PaymentTransactionInput } from '@/types/paymentTransaction';
import { paymentTransactionService } from '@/services/paymentTransactionService';

interface PaymentTransactionState {
  transactions: PaymentTransaction[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: PaymentTransactionInput) => Promise<void>;
  update: (id: number, payload: PaymentTransactionInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const usePaymentTransactionStore = create<PaymentTransactionState>((set, get) => ({
  transactions: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const transactions = await paymentTransactionService.list();
      set({ transactions });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await paymentTransactionService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await paymentTransactionService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await paymentTransactionService.remove(id);
    await get().fetchAll();
  },
}));