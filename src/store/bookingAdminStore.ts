import { create } from 'zustand';
import { ApiBooking, ApiBookingInput } from '@/types/bookingApi';
import { bookingAdminService } from '@/services/bookingAdminService';

interface BookingAdminState {
  bookings: ApiBooking[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: ApiBookingInput) => Promise<void>;
  update: (id: number, payload: ApiBookingInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useBookingAdminStore = create<BookingAdminState>((set, get) => ({
  bookings: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const bookings = await bookingAdminService.list();
      set({ bookings });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await bookingAdminService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await bookingAdminService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await bookingAdminService.remove(id);
    await get().fetchAll();
  },
}));