import { createCrudResource, createResourceHook } from './crudSlice';
import { theaterService } from '@/services/theaterService';
import type { Theater, TheaterInput } from '@/types/theater';
import type { RootState } from '@/app/store';

export const {
  slice: theaterSlice,
  fetchAll: fetchTheaters,
  create: createTheater,
  update: updateTheater,
  remove: removeTheater,
} = createCrudResource<Theater, TheaterInput>('theater', theaterService);

export const useTheatersResource = createResourceHook<Theater, TheaterInput>(
  (state: RootState) => state.theater,
  { fetchAll: fetchTheaters, create: createTheater, update: updateTheater, remove: removeTheater },
);

export const theaterReducer = theaterSlice.reducer;