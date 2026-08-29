import { create } from 'zustand';
import { ProductCategory, ProductCategoryInput } from '@/types/productCategory';
import { productCategoryService } from '@/services/productCategoryService';

interface ProductCategoryState {
  categories: ProductCategory[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: ProductCategoryInput) => Promise<void>;
  update: (id: number, payload: ProductCategoryInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useProductCategoryStore = create<ProductCategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const categories = await productCategoryService.list();
      set({ categories });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await productCategoryService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await productCategoryService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await productCategoryService.remove(id);
    await get().fetchAll();
  },
}));