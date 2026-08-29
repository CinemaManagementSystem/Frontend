import { create } from 'zustand';
import { Screen, ScreenInput } from '@/types/screen';
import { screenService } from '@/services/screenService';

interface ScreenState {
  screens: Screen[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: ScreenInput) => Promise<void>;
  update: (id: number, payload: ScreenInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useScreenStore = create<ScreenState>((set, get) => ({
  screens: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const screens = await screenService.list();
      set({ screens });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await screenService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await screenService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await screenService.remove(id);
    await get().fetchAll();
  },
}));