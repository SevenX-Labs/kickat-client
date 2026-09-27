import { api } from './api';
import {
  BackendProduct,
  BackendProductMedia,
  BackendProductVariant,
  PaginatedProductsResponse,
  ProductImagesResponse,
  ProductMediaResponse,
  ProductsQuery,
  ProductVariantsResponse,
  ProductVideosResponse,
  RelatedProductsResponse,
  SingleProductResponse,
} from '@/types/product';

export const productService = {
  /**
   * GET /api/v1/products
   * Fetch paginated products with advanced search, filtering, and sorting
   */
  async getProducts(query: ProductsQuery = {}): Promise<PaginatedProductsResponse> {
    const params = new URLSearchParams();

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.categoryId) params.set('categoryId', query.categoryId);
    if (query.brand) params.set('brand', query.brand);
    if (query.priceMin !== undefined) params.set('priceMin', String(query.priceMin));
    if (query.priceMax !== undefined) params.set('priceMax', String(query.priceMax));
    if (query.inStock !== undefined) params.set('inStock', String(query.inStock));
    if (query.petSpecies) params.set('petSpecies', query.petSpecies.toLowerCase());
    if (query.diet) params.set('diet', query.diet.toLowerCase());
    if (query.sort) params.set('sort', query.sort);
    if (query.rating !== undefined) params.set('rating', String(query.rating));

    const qs = params.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;
    return api<PaginatedProductsResponse>(endpoint, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:idOrSlug
   * Fetch complete product details by UUID or slug
   */
  async getProductById(idOrSlug: string): Promise<SingleProductResponse> {
    return api<SingleProductResponse>(`/products/${encodeURIComponent(idOrSlug)}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id/variants
   * Fetch product variants with SKU, pricing, attributes and stock
   */
  async getProductVariants(id: string): Promise<ProductVariantsResponse> {
    return api<ProductVariantsResponse>(`/products/${encodeURIComponent(id)}/variants`, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id/media
   * Fetch combined images and videos list
   */
  async getProductMedia(id: string): Promise<ProductMediaResponse> {
    return api<ProductMediaResponse>(`/products/${encodeURIComponent(id)}/media`, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id/images
   * Fetch main and gallery images
   */
  async getProductImages(id: string): Promise<ProductImagesResponse> {
    return api<ProductImagesResponse>(`/products/${encodeURIComponent(id)}/images`, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id/videos
   * Fetch product demo/explainer videos
   */
  async getProductVideos(id: string): Promise<ProductVideosResponse> {
    return api<ProductVideosResponse>(`/products/${encodeURIComponent(id)}/videos`, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id/related
   * Fetch related products based on category and species
   */
  async getRelatedProducts(id: string, limit: number = 8): Promise<RelatedProductsResponse> {
    return api<RelatedProductsResponse>(`/products/${encodeURIComponent(id)}/related?limit=${limit}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id/reviews
   * Fetch product-specific reviews feed
   */
  async getProductReviews(id: string, query: { page?: number; limit?: number; rating?: number; sort?: string; hasPhotos?: boolean; verifiedOnly?: boolean } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.rating) params.set('rating', String(query.rating));
    if (query.sort) params.set('sort', query.sort);
    if (query.hasPhotos) params.set('hasPhotos', 'true');
    if (query.verifiedOnly) params.set('verifiedOnly', 'true');

    const qs = params.toString();
    const endpoint = `/products/${encodeURIComponent(id)}/reviews${qs ? `?${qs}` : ''}`;
    return api<any>(endpoint, { method: 'GET' });
  },
};
