export interface MovieCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface MovieCategoryInput {
  name: string;
  description: string;
  isActive: boolean;
}