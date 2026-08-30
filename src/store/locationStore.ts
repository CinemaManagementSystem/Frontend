import { create } from 'zustand';
import { Location, LocationInput } from '@/types/location';
import { locationService } from '@/services/locationService';

interface LocationState {
  locations: Location[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: LocationInput) => Promise<void>;
  update: (id: number, payload: LocationInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const locations = await locationService.list();
      set({ locations });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await locationService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await locationService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await locationService.remove(id);
    await get().fetchAll();
  },
}));