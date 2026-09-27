import { api } from './api';
import {
  CategoriesResponse,
  CategoryProductsQuery,
  CategoryProductsResponse,
  SingleCategoryResponse,
} from '@/types/category';

export const categoryService = {
  /**
   * GET /api/v1/categories
   * Fetch flat list of active categories ordered by display order
   */
  async getCategories(): Promise<CategoriesResponse> {
    return api<CategoriesResponse>('/categories', { method: 'GET' });
  },

  /**
   * GET /api/v1/categories/tree
   * Fetch active root categories with active child categories
   */
  async getCategoryTree(): Promise<CategoriesResponse> {
    return api<CategoriesResponse>('/categories/tree', { method: 'GET' });
  },

  /**
   * GET /api/v1/categories/:id
   * Fetch category details using either UUID or slug
   */
  async getCategoryById(idOrSlug: string): Promise<SingleCategoryResponse> {
    return api<SingleCategoryResponse>(`/categories/${encodeURIComponent(idOrSlug)}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/categories/:id/products
   * Fetch paginated products belonging to a category, including nested subcategories
   */
  async getCategoryProducts(
    idOrSlug: string,
    query: CategoryProductsQuery = {}
  ): Promise<CategoryProductsResponse> {
    const params = new URLSearchParams();

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.sort) params.set('sort', query.sort);
    if (query.priceMin !== undefined) params.set('priceMin', String(query.priceMin));
    if (query.priceMax !== undefined) params.set('priceMax', String(query.priceMax));
    if (query.inStock !== undefined) params.set('inStock', String(query.inStock));
    if (query.brand) params.set('brand', query.brand);
    if (query.petSpecies) params.set('petSpecies', query.petSpecies);
    if (query.diet) params.set('diet', query.diet);

    const qs = params.toString();
    const endpoint = `/categories/${encodeURIComponent(idOrSlug)}/products${qs ? `?${qs}` : ''}`;
    return api<CategoryProductsResponse>(endpoint, { method: 'GET' });
  },
};
