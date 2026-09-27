import { BackendProduct } from './product';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  isActive: boolean;
  order: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  category: Category;
}

export interface CategoryProductsQuery {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'popularity' | 'price_asc' | 'price_desc' | 'rating' | string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  brand?: string;
  petSpecies?: string;
  diet?: string;
}

export interface CategoryProductsResponse {
  success: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  products: BackendProduct[];
}
