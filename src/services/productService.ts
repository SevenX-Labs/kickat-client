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

const variantsCache: Record<string, BackendProductVariant[]> = {};

function deduplicateVariants(variants: BackendProductVariant[]): BackendProductVariant[] {
  if (!Array.isArray(variants)) return [];
  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();
  return variants.filter((v) => {
    if (!v || !v.id) return false;
    let label = (v.name || '').trim();
    if (v.attributes && typeof v.attributes === 'object') {
      const vals = Object.values(v.attributes).filter(Boolean);
      if (vals.length > 0) label = String(vals[0]).trim();
    }
    const idKey = v.id;
    const labelKey = label ? label.toLowerCase() : '';
    if (seenIds.has(idKey) || (labelKey && seenLabels.has(labelKey))) {
      return false;
    }
    seenIds.add(idKey);
    if (labelKey) seenLabels.add(labelKey);
    return true;
  });
}

async function enrichProductsWithVariants(products: BackendProduct[]): Promise<BackendProduct[]> {
  if (!Array.isArray(products) || products.length === 0) return products;

  const variableProducts = products.filter((p) => p && p.type === 'VARIABLE' && (!p.variants || p.variants.length === 0));
  if (variableProducts.length === 0) return products;

  await Promise.all(
    variableProducts.map(async (p) => {
      try {
        if (variantsCache[p.id]) {
          p.variants = variantsCache[p.id];
          return;
        }
        const res = await api<ProductVariantsResponse>(`/products/${encodeURIComponent(p.id)}/variants`, { method: 'GET' });
        if (res.success && Array.isArray(res.variants)) {
          const deduped = deduplicateVariants(res.variants);
          variantsCache[p.id] = deduped;
          p.variants = deduped;
        }
      } catch (err) {
        // silent fallback
      }
    })
  );

  return products;
}

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
    const res = await api<PaginatedProductsResponse>(endpoint, { method: 'GET' });
    if (res && Array.isArray(res.products)) {
      await enrichProductsWithVariants(res.products);
    }
    return res;
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
    if (variantsCache[id]) {
      return { success: true, productId: id, variants: variantsCache[id] };
    }
    const res = await api<ProductVariantsResponse>(`/products/${encodeURIComponent(id)}/variants`, { method: 'GET' });
    if (res && res.success && Array.isArray(res.variants)) {
      const deduped = deduplicateVariants(res.variants);
      variantsCache[id] = deduped;
      return { success: true, productId: id, variants: deduped };
    }
    return res;
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
    const res = await api<RelatedProductsResponse>(`/products/${encodeURIComponent(id)}/related?limit=${limit}`, { method: 'GET' });
    if (res && Array.isArray(res.relatedProducts)) {
      await enrichProductsWithVariants(res.relatedProducts);
    }
    return res;
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

  /**
   * GET /api/v1/products/best-sellers
   * Fetch best-selling products from the database
   */
  async getBestSellers(limit: number = 8): Promise<{ success: boolean; products: BackendProduct[] }> {
    const res = await api<{ success: boolean; products: BackendProduct[] }>(`/products/best-sellers?limit=${limit}`, {
      method: 'GET',
    });
    if (res && Array.isArray(res.products)) {
      await enrichProductsWithVariants(res.products);
    }
    return res;
  },

  /**
   * GET /api/v1/products/trending
   * Fetch trending products from the database
   */
  async getTrending(limit: number = 8): Promise<{ success: boolean; products: BackendProduct[] }> {
    const res = await api<{ success: boolean; products: BackendProduct[] }>(`/products/trending?limit=${limit}`, {
      method: 'GET',
    });
    if (res && Array.isArray(res.products)) {
      await enrichProductsWithVariants(res.products);
    }
    return res;
  },

  /**
   * GET /api/v1/products?sort=newest
   * Fetch new arrival products from the database
   */
  async getNewArrivals(limit: number = 8): Promise<PaginatedProductsResponse> {
    const res = await api<PaginatedProductsResponse>(`/products?sort=newest&limit=${limit}`, {
      method: 'GET',
    });
    if (res && Array.isArray(res.products)) {
      await enrichProductsWithVariants(res.products);
    }
    return res;
  },
};
