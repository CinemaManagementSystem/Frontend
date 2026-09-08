import { create } from 'zustand';
import { ApiBooking, ApiBookingInput } from '@/types/bookingApi';
import { getApiErrorMessage } from '@/services/apiClient';
import { bookingAdminService } from '@/services/bookingAdminService';

interface BookingAdminState {
  bookings: ApiBooking[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (payload: ApiBookingInput) => Promise<void>;
  update: (id: number, payload: ApiBookingInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

let inFlightFetch: Promise<void> | null = null;

export const useBookingAdminStore = create<BookingAdminState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    if (inFlightFetch) return inFlightFetch;

    const request = (async () => {
      set({ loading: true, error: null });
      try {
        const bookings = await bookingAdminService.list();
        set({ bookings, error: null });
      } catch (error) {
        set({ error: getApiErrorMessage(error, 'bookings') });
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
