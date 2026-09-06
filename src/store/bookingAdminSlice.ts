import { createCrudResource, createResourceHook } from './crudSlice';
import { bookingAdminService } from '@/services/bookingAdminService';
import type { ApiBooking, ApiBookingInput } from '@/types/bookingApi';
import type { RootState } from '@/app/store';

export const {
  slice: bookingAdminSlice,
  fetchAll: fetchAdminBookings,
  create: createAdminBooking,
  update: updateAdminBooking,
  remove: removeAdminBooking,
} = createCrudResource<ApiBooking, ApiBookingInput>('bookingAdmin', bookingAdminService);

export const useAdminBookingsResource = createResourceHook<ApiBooking, ApiBookingInput>(
  (state: RootState) => state.bookingAdmin,
  { fetchAll: fetchAdminBookings, create: createAdminBooking, update: updateAdminBooking, remove: removeAdminBooking },
);

export const bookingAdminReducer = bookingAdminSlice.reducer;