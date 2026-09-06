import { createCrudResource, createResourceHook } from './crudSlice';
import { showService } from '@/services/showService';
import type { Show, ShowInput } from '@/types/show';
import type { RootState } from '@/app/store';

export const {
  slice: showSlice,
  fetchAll: fetchShows,
  create: createShow,
  update: updateShow,
  remove: removeShow,
} = createCrudResource<Show, ShowInput>('show', showService);

export const useShowsResource = createResourceHook<Show, ShowInput>(
  (state: RootState) => state.show,
  { fetchAll: fetchShows, create: createShow, update: updateShow, remove: removeShow },
);

export const showReducer = showSlice.reducer;