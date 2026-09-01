import { createCrudResource, createResourceHook } from './crudSlice';
import { bookingSeatService } from '@/services/bookingSeatService';
import type { BookingSeat, BookingSeatInput } from '@/types/bookingSeat';
import type { RootState } from '@/app/store';

export const {
  slice: bookingSeatSlice,
  fetchAll: fetchBookingSeats,
  create: createBookingSeat,
  update: updateBookingSeat,
  remove: removeBookingSeat,
} = createCrudResource<BookingSeat, BookingSeatInput>('bookingSeat', bookingSeatService);

export const useBookingSeatsResource = createResourceHook<BookingSeat, BookingSeatInput>(
  (state: RootState) => state.bookingSeat,
  { fetchAll: fetchBookingSeats, create: createBookingSeat, update: updateBookingSeat, remove: removeBookingSeat },
);

export const bookingSeatReducer = bookingSeatSlice.reducer;