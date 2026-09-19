import { api } from './api';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  product: any;
  variant: any;
}

export interface WishlistResponse {
  success: boolean;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  items: WishlistItem[];
}

export const wishlistService = {
  getWishlist: async (page = 1, limit = 10) => {
    return api<WishlistResponse>(`v1/wishlist?page=${page}&limit=${limit}`);
  },
  
  addToWishlist: async (productId: string, variantId?: string) => {
    const data: any = { productId };
    if (variantId) data.variantId = variantId;
    return api<any>('v1/wishlist', {
      method: 'POST',
      data
    });
  },
  
  removeFromWishlist: async (productId: string, variantId?: string) => {
    let url = `v1/wishlist/${productId}`;
    if (variantId) {
      url += `?variantId=${variantId}`;
    }
    return api<any>(url, {
      method: 'DELETE'
    });
  },
  
  moveToCart: async (productId: string, variantId?: string, quantity: number = 1) => {
    let url = `v1/wishlist/${productId}/move-to-cart`;
    if (variantId) {
      url += `?variantId=${variantId}`;
    }
    return api<any>(url, {
      method: 'POST',
      data: { quantity }
    });
  }
};
