export interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
  productCategoryId: number;
}

export interface ProductInput {
  name: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  productCategoryId: number;
}