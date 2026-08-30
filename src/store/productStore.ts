import { create } from 'zustand';
import { Product, ProductInput } from '@/types/product';
import { productService } from '@/services/productService';

interface ProductState {
  products: Product[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: ProductInput, image?: File | null) => Promise<void>;
  update: (id: number, payload: ProductInput, image?: File | null) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const products = await productService.list();
      set({ products });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload, image) => {
    await productService.create(payload, image);
    await get().fetchAll();
  },

  update: async (id, payload, image) => {
    await productService.update(id, payload, image);
    await get().fetchAll();
  },

  remove: async (id) => {
    await productService.remove(id);
    await get().fetchAll();
  },
}));