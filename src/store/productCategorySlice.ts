import { createCrudResource, createResourceHook } from './crudSlice';
import { productCategoryService } from '@/services/productCategoryService';
import type { ProductCategory, ProductCategoryInput } from '@/types/productCategory';
import type { RootState } from '@/app/store';

export const {
  slice: productCategorySlice,
  fetchAll: fetchProductCategories,
  create: createProductCategory,
  update: updateProductCategory,
  remove: removeProductCategory,
} = createCrudResource<ProductCategory, ProductCategoryInput>('productCategory', productCategoryService);

export const useProductCategoriesResource = createResourceHook<ProductCategory, ProductCategoryInput>(
  (state: RootState) => state.productCategory,
  {
    fetchAll: fetchProductCategories,
    create: createProductCategory,
    update: updateProductCategory,
    remove: removeProductCategory,
  },
);

export const productCategoryReducer = productCategorySlice.reducer;