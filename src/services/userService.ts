import { api, getAccessToken } from './api';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  rating?: number;
  imageUrl?: string;
  stock?: number;
  status?: string;
  viewedAt?: string;
}

const LOCAL_STORAGE_KEY = 'kickat_recently_viewed_items';

export const userService = {
  /**
   * Log product view
   * POST /api/v1/users/me/recently-viewed
   */
  async trackProductView(productId: string, productDetails?: Partial<RecentlyViewedProduct>): Promise<void> {
    if (!productId) return;

    // 1. Save locally for guest / instant retrieval
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        let list: RecentlyViewedProduct[] = stored ? JSON.parse(stored) : [];
        list = list.filter((p) => p.id !== productId);
        if (productDetails && productDetails.name) {
          list.unshift({
            id: productId,
            name: productDetails.name,
            price: productDetails.price ?? 0,
            discountPrice: productDetails.discountPrice,
            rating: productDetails.rating ?? 4.8,
            imageUrl: productDetails.imageUrl,
            stock: productDetails.stock ?? 10,
            status: 'ACTIVE',
            viewedAt: new Date().toISOString(),
          });
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
        window.dispatchEvent(new CustomEvent('recently-viewed-updated'));
      } catch (e) {
        console.warn('Failed to update local recently viewed:', e);
      }
    }

    // 2. Sync to server if authenticated
    const token = getAccessToken();
    if (token) {
      try {
        await api('/users/me/recently-viewed', {
          method: 'POST',
          data: { productId },
        });
      } catch (err) {
        console.warn('Failed to record product view to server:', err);
      }
    }
  },

  /**
   * Fetch user's recently viewed products
   * GET /api/v1/users/me/recently-viewed with fallback to local store
   */
  async getRecentlyViewed(): Promise<RecentlyViewedProduct[]> {
    const token = getAccessToken();

    if (token) {
      try {
        const res = await api<{ success: boolean; data: RecentlyViewedProduct[] }>(
          '/users/me/recently-viewed',
          { method: 'GET' }
        );
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch (err) {
        console.warn('Failed to fetch recently viewed products from server:', err);
      }
    }

    // Fallback to local storage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const list: RecentlyViewedProduct[] = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            return list;
          }
        }
      } catch (e) {
        console.warn('Failed to parse local recently viewed:', e);
      }
    }

    return [];
  },
  /**
   * Send Phone Verification OTP for logged in user (POST /api/v1/users/mobile/send-verification)
   */
  async sendMobileVerification(phone?: string): Promise<{ success: boolean; message: string }> {
    const data = phone ? { phone: phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}` } : {};
    return api<{ success: boolean; message: string }>("/users/mobile/send-verification", {
      method: "POST",
      data,
    });
  },

  /**
   * Verify Phone OTP for logged in user (POST /api/v1/users/mobile/verify)
   */
  async verifyMobile(otp: string, phone?: string): Promise<{ success: boolean; message: string; user?: any }> {
    const data: Record<string, string> = { otp };
    if (phone) {
      data.phone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;
    }
    return api<{ success: boolean; message: string; user?: any }>("/users/mobile/verify", {
      method: "POST",
      data,
    });
  },

  /**
   * Send Email Verification OTP for logged in user (POST /api/v1/users/email/send-verification)
   */
  async sendEmailVerification(email?: string): Promise<{ success: boolean; message: string }> {
    const data = email ? { email } : {};
    return api<{ success: boolean; message: string }>("/users/email/send-verification", {
      method: "POST",
      data,
    });
  },

  /**
   * Verify Email OTP for logged in user (POST /api/v1/users/email/verify)
   */
  async verifyEmail(otp: string, email?: string): Promise<{ success: boolean; message: string; user?: any }> {
    const data: Record<string, string> = { otp };
    if (email) {
      data.email = email;
    }
    return api<{ success: boolean; message: string; user?: any }>("/users/email/verify", {
      method: "POST",
      data,
    });
  },
};