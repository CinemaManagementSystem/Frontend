import { create } from 'zustand';
import { BookingSeat, BookingSeatInput } from '@/types/bookingSeat';
import { bookingSeatService } from '@/services/bookingSeatService';

interface BookingSeatState {
  bookingSeats: BookingSeat[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: BookingSeatInput) => Promise<void>;
  update: (id: number, payload: BookingSeatInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useBookingSeatStore = create<BookingSeatState>((set, get) => ({
  bookingSeats: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const bookingSeats = await bookingSeatService.list();
      set({ bookingSeats });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await bookingSeatService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await bookingSeatService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await bookingSeatService.remove(id);
    await get().fetchAll();
  },
}));