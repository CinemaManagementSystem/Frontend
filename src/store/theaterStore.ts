import { create } from 'zustand';
import { Theater, TheaterInput } from '@/types/theater';
import { theaterService } from '@/services/theaterService';

interface TheaterState {
  theaters: Theater[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: TheaterInput) => Promise<void>;
  update: (id: number, payload: TheaterInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useTheaterStore = create<TheaterState>((set, get) => ({
  theaters: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const theaters = await theaterService.list();
      set({ theaters });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await theaterService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await theaterService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await theaterService.remove(id);
    await get().fetchAll();
  },
}));