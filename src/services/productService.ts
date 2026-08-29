import { apiClient } from './apiClient';
import { Product, ProductInput } from '@/types/product';

function buildFormData(payload: ProductInput, image?: File | null): FormData {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('price', String(payload.price));
  form.append('stockQuantity', String(payload.stockQuantity));
  form.append('isAvailable', String(payload.isAvailable));
  form.append('productCategoryId', String(payload.productCategoryId));
  if (image) form.append('image', image);
  return form;
}

export const productService = {
  async list(): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products');
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: ProductInput, image?: File | null): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', buildFormData(payload, image));
    return data;
  },

  async update(id: number, payload: ProductInput, image?: File | null): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, buildFormData(payload, image));
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};