import { create } from 'zustand';
import { Seat, SeatInput } from '@/types/seat';
import { seatService } from '@/services/seatService';

interface SeatState {
  seats: Seat[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: SeatInput) => Promise<void>;
  update: (id: number, payload: SeatInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useSeatStore = create<SeatState>((set, get) => ({
  seats: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const seats = await seatService.list();
      set({ seats });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await seatService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await seatService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await seatService.remove(id);
    await get().fetchAll();
  },
}));