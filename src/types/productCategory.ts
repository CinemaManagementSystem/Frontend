export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ProductCategoryInput {
  name: string;
  description: string;
  isActive: boolean;
}