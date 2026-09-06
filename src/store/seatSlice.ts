import { createCrudResource, createResourceHook } from './crudSlice';
import { seatService } from '@/services/seatService';
import type { Seat, SeatInput } from '@/types/seat';
import type { RootState } from '@/app/store';

export const {
  slice: seatSlice,
  fetchAll: fetchSeats,
  create: createSeat,
  update: updateSeat,
  remove: removeSeat,
} = createCrudResource<Seat, SeatInput>('seat', seatService);

export const useSeatsResource = createResourceHook<Seat, SeatInput>(
  (state: RootState) => state.seat,
  { fetchAll: fetchSeats, create: createSeat, update: updateSeat, remove: removeSeat },
);

export const seatReducer = seatSlice.reducer;