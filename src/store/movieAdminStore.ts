import { create } from 'zustand';
import { ApiMovie, ApiMovieInput } from '@/types/movieApi';
import { movieAdminService } from '@/services/movieAdminService';

interface MovieAdminState {
  movies: ApiMovie[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: ApiMovieInput) => Promise<void>;
  update: (id: number, payload: ApiMovieInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useMovieAdminStore = create<MovieAdminState>((set, get) => ({
  movies: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const movies = await movieAdminService.list();
      set({ movies });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await movieAdminService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await movieAdminService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await movieAdminService.remove(id);
    await get().fetchAll();
  },
}));