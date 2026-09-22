import { create } from 'zustand';
import { PaymentTransaction, PaymentTransactionInput } from '@/types/paymentTransaction';
import type { PaymentStatus } from '@/types/payment';
import { paymentTransactionService } from '@/services/paymentTransactionService';

interface PaymentTransactionState {
  transactions: PaymentTransaction[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  statusFilter: PaymentStatus | 'ALL';
  fetchAll: () => Promise<void>;
  fetchPage: (params?: { page?: number; size?: number; status?: PaymentStatus | 'ALL' }) => Promise<void>;
  setStatusFilter: (status: PaymentStatus | 'ALL') => Promise<void>;
  create: (payload: PaymentTransactionInput) => Promise<void>;
  update: (id: number, payload: PaymentTransactionInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const usePaymentTransactionStore = create<PaymentTransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  page: 0,
  pageSize: 10,
  totalPages: 1,
  totalElements: 0,
  statusFilter: 'PAID',

  fetchAll: async () => {
    set({ loading: true });
    try {
      const transactions = await paymentTransactionService.list();
      set({ transactions });
    } finally {
      set({ loading: false });
    }
  },

  fetchPage: async (params = {}) => {
    const state = get();
    const page = params.page ?? state.page;
    const pageSize = params.size ?? state.pageSize;
    const status = params.status ?? state.statusFilter;
    set({ loading: true, page, pageSize, statusFilter: status });
    try {
      const result = await paymentTransactionService.listPage({
        page,
        size: pageSize,
        status,
        sort: 'id,desc',
      });
      set({
        transactions: result.content,
        page: result.number,
        pageSize: result.size,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
      });
    } finally {
      set({ loading: false });
    }
  },

  setStatusFilter: async (status) => {
    await get().fetchPage({ page: 0, status });
  },

  create: async (payload) => {
    await paymentTransactionService.create(payload);
    await get().fetchPage();
  },

  update: async (id, payload) => {
    await paymentTransactionService.update(id, payload);
    await get().fetchPage();
  },

  remove: async (id) => {
    await paymentTransactionService.remove(id);
    await get().fetchPage();
  },
}));
