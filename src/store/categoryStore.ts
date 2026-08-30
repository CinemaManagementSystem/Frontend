import { create } from 'zustand';
import { MovieCategory, MovieCategoryInput } from '@/types/category';
import { categoryService } from '@/services/categoryService';

interface CategoryState {
  categories: MovieCategory[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: MovieCategoryInput) => Promise<void>;
  update: (id: number, payload: MovieCategoryInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const categories = await categoryService.list();
      set({ categories });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await categoryService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await categoryService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await categoryService.remove(id);
    await get().fetchAll();
  },
}));