import { createCrudResource, createResourceHook } from './crudSlice';
import { movieAdminService } from '@/services/movieAdminService';
import type { ApiMovie, ApiMovieInput } from '@/types/movieApi';
import type { RootState } from '@/app/store';

export const {
  slice: movieAdminSlice,
  fetchAll: fetchAdminMovies,
  create: createAdminMovie,
  update: updateAdminMovie,
  remove: removeAdminMovie,
} = createCrudResource<ApiMovie, ApiMovieInput>('movieAdmin', movieAdminService);

export const useAdminMoviesResource = createResourceHook<ApiMovie, ApiMovieInput>(
  (state: RootState) => state.movieAdmin,
  { fetchAll: fetchAdminMovies, create: createAdminMovie, update: updateAdminMovie, remove: removeAdminMovie },
);

export const movieAdminReducer = movieAdminSlice.reducer;