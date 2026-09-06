import { createCrudResource, createResourceHook } from './crudSlice';
import { productService } from '@/services/productService';
import type { Product, ProductInput } from '@/types/product';
import type { RootState } from '@/app/store';

export const {
  slice: productSlice,
  fetchAll: fetchProducts,
  create: createProduct,
  update: updateProduct,
  remove: removeProduct,
} = createCrudResource<Product, ProductInput>('product', productService);

export const useProductsResource = createResourceHook<Product, ProductInput>(
  (state: RootState) => state.product,
  { fetchAll: fetchProducts, create: createProduct, update: updateProduct, remove: removeProduct },
);

export const productReducer = productSlice.reducer;