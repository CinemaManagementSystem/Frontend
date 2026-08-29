import { apiClient } from './apiClient';
import { ProductCategory, ProductCategoryInput } from '@/types/productCategory';

export const productCategoryService = {
  async list(): Promise<ProductCategory[]> {
    const { data } = await apiClient.get<ProductCategory[]>('/product-categories');
    return data;
  },

  async getById(id: number): Promise<ProductCategory> {
    const { data } = await apiClient.get<ProductCategory>(`/product-categories/${id}`);
    return data;
  },

  async create(payload: ProductCategoryInput): Promise<ProductCategory> {
    const { data } = await apiClient.post<ProductCategory>('/product-categories', payload);
    return data;
  },

  async update(id: number, payload: ProductCategoryInput): Promise<ProductCategory> {
    const { data } = await apiClient.put<ProductCategory>(`/product-categories/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/product-categories/${id}`);
  },
};