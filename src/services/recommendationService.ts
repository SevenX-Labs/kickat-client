import { api, getAccessToken } from './api';
import { enrichProductsWithVariants } from './productService';
import {
  RecommendedProductsResponse,
  RecentlyViewedProductsResponse,
  RecordActivityResponse,
} from '@/types/recommendation';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clampLimit(limit?: number): number {
  if (typeof limit !== 'number' || isNaN(limit)) return 10;
  return Math.min(20, Math.max(1, Math.floor(limit)));
}

export const recommendationService = {
  /**
   * GET /api/v1/customer/products/recommended?limit=10
   * Fetches personalized customer recommendations (or fallback trending/best-sellers if cold start).
   */
  async getRecommended(limit: number = 10): Promise<RecommendedProductsResponse> {
    const token = getAccessToken();
    if (!token) {
      return { success: false, personalized: false, products: [] };
    }

    try {
      const clamped = clampLimit(limit);
      const res = await api<RecommendedProductsResponse>(
        `/customer/products/recommended?limit=${clamped}`,
        { method: 'GET' }
      );

      if (res && Array.isArray(res.products) && res.products.length > 0) {
        await enrichProductsWithVariants(res.products);
      }

      return res;
    } catch (err) {
      console.warn('Failed to load customer recommendations:', err);
      return { success: false, personalized: false, products: [] };
    }
  },

  /**
   * GET /api/v1/customer/products/recently-viewed?limit=10
   * Fetches customer's recently viewed products list (newest first).
   */
  async getRecentlyViewed(limit: number = 10): Promise<RecentlyViewedProductsResponse> {
    const token = getAccessToken();
    if (!token) {
      return { success: false, products: [] };
    }

    try {
      const clamped = clampLimit(limit);
      const res = await api<RecentlyViewedProductsResponse>(
        `/customer/products/recently-viewed?limit=${clamped}`,
        { method: 'GET' }
      );

      if (res && Array.isArray(res.products) && res.products.length > 0) {
        await enrichProductsWithVariants(res.products);
      }

      return res;
    } catch (err) {
      console.warn('Failed to load customer recently viewed feed:', err);
      return { success: false, products: [] };
    }
  },

  /**
   * POST /api/v1/customer/activity/search
   * Records a search query signal in the backend. Fire-and-forget; ignores failures silently.
   * Never passes userId.
   */
  async recordSearch(query: string): Promise<void> {
    const token = getAccessToken();
    if (!token) return;

    const trimmed = (query || '').trim();
    if (!trimmed || trimmed.length > 100) return;

    try {
      await api<RecordActivityResponse>('/customer/activity/search', {
        method: 'POST',
        data: { query: trimmed },
      });
    } catch {
      // Fire-and-forget: silently ignore errors
    }
  },

  /**
   * POST /api/v1/customer/activity/view
   * Records a product view signal in the backend. Fire-and-forget; ignores failures silently.
   * Only calls if productId is a valid UUID. Never passes userId.
   */
  async recordView(productId: string): Promise<void> {
    const token = getAccessToken();
    if (!token) return;

    if (!productId || typeof productId !== 'string' || !UUID_V4_REGEX.test(productId)) {
      return;
    }

    try {
      await api<RecordActivityResponse>('/customer/activity/view', {
        method: 'POST',
        data: { productId },
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('recently-viewed-updated'));
      }
    } catch {
      // Fire-and-forget: silently ignore errors
    }
  },
};

export const recommendationApi = recommendationService;
