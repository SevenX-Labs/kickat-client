
export interface DeliveryEstimateResponse {
  available: boolean;
  pincode: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  estimatedDeliveryDays?: number;
  formattedDate?: string;
  message?: string;
}

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

export function deduplicateVariants(variants: BackendProductVariant[]): BackendProductVariant[] {
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

export async function enrichProductsWithVariants(products: BackendProduct[]): Promise<BackendProduct[]> {
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

// ── Delivery estimate cache (5-min TTL) + request deduplication ──
const DELIVERY_CACHE_TTL_MS = 5 * 60 * 1000;
const deliveryEstimateCache = new Map<string, { data: DeliveryEstimateResponse; ts: number }>();
const deliveryEstimateInflight = new Map<string, Promise<DeliveryEstimateResponse>>();

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
   * Fetch related products based on category and species with in-memory caching
   */
  async getRelatedProducts(id: string, limit: number = 8): Promise<RelatedProductsResponse> {
    const cacheKey = `${id}-${limit}`;
    if ((globalThis as any).__kickat_related_cache?.has(cacheKey)) {
      return (globalThis as any).__kickat_related_cache.get(cacheKey);
    }

    try {
      const res = await api<RelatedProductsResponse>(`/products/${encodeURIComponent(id)}/related?limit=${limit}`, { method: 'GET' });
      if (res && Array.isArray(res.relatedProducts)) {
        await enrichProductsWithVariants(res.relatedProducts);
        if (!(globalThis as any).__kickat_related_cache) {
          (globalThis as any).__kickat_related_cache = new Map<string, RelatedProductsResponse>();
        }
        (globalThis as any).__kickat_related_cache.set(cacheKey, res);
      }
      return res;
    } catch (err: any) {
      if (err?.message?.includes('Too Many Requests') || err?.status === 429) {
        return { success: false, productId: id, relatedProducts: [] };
      }
      throw err;
    }
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
  /**
   * GET /api/v1/shipping/delivery-estimate
   * Fetch customer delivery estimate by pincode and optional variant/weight.
   * Includes in-memory cache (5 min TTL), request deduplication, and 429 retry.
   */
  async getDeliveryEstimate(params: {
    pincode: string;
    productId?: string;
    variantId?: string;
    weight?: number;
  }): Promise<DeliveryEstimateResponse> {
    const cacheKey = `${params.pincode}|${params.productId || ""}|${params.variantId || ""}`;

    // 1. Return from cache if fresh (5-minute TTL)
    const cached = deliveryEstimateCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < DELIVERY_CACHE_TTL_MS) {
      return cached.data;
    }

    // 2. Deduplicate: if an identical request is already in-flight, piggy-back on it
    const inflight = deliveryEstimateInflight.get(cacheKey);
    if (inflight) {
      return inflight;
    }

    const query = new URLSearchParams();
    query.set("pincode", params.pincode);
    if (params.productId) query.set("productId", params.productId);
    if (params.variantId) query.set("variantId", params.variantId);
    if (params.weight) query.set("weight", String(params.weight));

    const doFetch = async (): Promise<DeliveryEstimateResponse> => {
      try {
        const res = await api<DeliveryEstimateResponse>(
          `/shipping/delivery-estimate?${query.toString()}`,
          { method: "GET" }
        );
        // Cache successful responses
        if (res && res.available) {
          deliveryEstimateCache.set(cacheKey, { data: res, ts: Date.now() });
        }
        return res;
      } catch (err: any) {
        // 429 retry: wait 2s and try once more
        if (err?.message?.includes("429") || err?.message?.toLowerCase().includes("too many")) {
          await new Promise((r) => setTimeout(r, 2000));
          const retryRes = await api<DeliveryEstimateResponse>(
            `/shipping/delivery-estimate?${query.toString()}`,
            { method: "GET" }
          );
          if (retryRes && retryRes.available) {
            deliveryEstimateCache.set(cacheKey, { data: retryRes, ts: Date.now() });
          }
          return retryRes;
        }
        throw err;
      }
    };

    const promise = doFetch().finally(() => {
      deliveryEstimateInflight.delete(cacheKey);
    });
    deliveryEstimateInflight.set(cacheKey, promise);
    return promise;
  },
};
