import { create } from 'zustand';
import { Theater, TheaterInput } from '@/types/theater';
import { getApiErrorMessage } from '@/services/apiClient';
import { theaterService } from '@/services/theaterService';

interface TheaterState {
  theaters: Theater[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (payload: TheaterInput) => Promise<void>;
  update: (id: number, payload: TheaterInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

let inFlightFetch: Promise<void> | null = null;

export const useTheaterStore = create<TheaterState>((set, get) => ({
  theaters: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    if (inFlightFetch) return inFlightFetch;

    const request = (async () => {
      set({ loading: true, error: null });
      try {
        const theaters = await theaterService.list();
        set({ theaters, error: null });
      } catch (error) {
        set({ error: getApiErrorMessage(error, 'theaters') });
      } finally {
        set({ loading: false });
      }
    })();

    inFlightFetch = request;
    try {
      await request;
    } finally {
      if (inFlightFetch === request) inFlightFetch = null;
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
