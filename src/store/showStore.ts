import { create } from 'zustand';
import { Show, ShowInput } from '@/types/show';
import { showService } from '@/services/showService';

interface ShowState {
  shows: Show[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: ShowInput) => Promise<void>;
  update: (id: number, payload: ShowInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useShowStore = create<ShowState>((set, get) => ({
  shows: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const shows = await showService.list();
      set({ shows });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await showService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await showService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await showService.remove(id);
    await get().fetchAll();
  },
}));