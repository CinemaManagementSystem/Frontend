import { createCrudResource, createResourceHook } from './crudSlice';
import { categoryService } from '@/services/categoryService';
import type { MovieCategory, MovieCategoryInput } from '@/types/category';
import type { RootState } from '@/app/store';

export const {
  slice: categorySlice,
  fetchAll: fetchCategories,
  create: createCategory,
  update: updateCategory,
  remove: removeCategory,
} = createCrudResource<MovieCategory, MovieCategoryInput>('category', categoryService);

export const useCategoriesResource = createResourceHook<MovieCategory, MovieCategoryInput>(
  (state: RootState) => state.category,
  { fetchAll: fetchCategories, create: createCategory, update: updateCategory, remove: removeCategory },
);

export const categoryReducer = categorySlice.reducer;