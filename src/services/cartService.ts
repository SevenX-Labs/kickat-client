import { api } from './api';
import { CartResponse, BuyNowResponse } from '@/types/cart';

export const cartService = {
  /**
   * Get active user cart (Authenticated)
   */
  getCart: async (): Promise<CartResponse> => {
    return api<CartResponse>('cart');
  },

  /**
   * Add product/variant to active user cart (Authenticated)
   */
  addCartItem: async (productId: string, variantId?: string, quantity: number = 1): Promise<CartResponse> => {
    const data: { productId: string; variantId?: string; quantity: number } = {
      productId,
      quantity,
    };
    if (variantId) {
      data.variantId = variantId;
    }
    return api<CartResponse>('cart/items', {
      method: 'POST',
      data,
    });
  },

  /**
   * Update item quantity in active user cart (Authenticated)
   */
  updateCartItem: async (itemId: string, quantity: number): Promise<CartResponse> => {
    return api<CartResponse>(`cart/items/${itemId}`, {
      method: 'PUT',
      data: { quantity },
    });
  },

  /**
   * Remove item from active user cart (Authenticated)
   */
  removeCartItem: async (itemId: string): Promise<{ success: boolean; message: string }> => {
    return api<{ success: boolean; message: string }>(`cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Direct checkout buy-now session (Authenticated)
   */
  buyNow: async (productId: string, variantId?: string, quantity: number = 1): Promise<BuyNowResponse> => {
    const data: { productId: string; variantId?: string; quantity: number } = {
      productId,
      quantity,
    };
    if (variantId) {
      data.variantId = variantId;
    }
    return api<BuyNowResponse>('cart/buy-now', {
      method: 'POST',
      data,
    });
  },

  /**
   * Get guest cart by session ID (Guest)
   */
  getGuestCart: async (sessionId: string): Promise<CartResponse> => {
    return api<CartResponse>(`cart/guest/${sessionId}`);
  },

  /**
   * Add item to guest cart (Guest)
   */
  addGuestCartItem: async (
    guestSessionId: string,
    productId: string,
    variantId?: string,
    quantity: number = 1
  ): Promise<CartResponse> => {
    const data: { guestSessionId: string; productId: string; variantId?: string; quantity: number } = {
      guestSessionId,
      productId,
      quantity,
    };
    if (variantId) {
      data.variantId = variantId;
    }
    return api<CartResponse>('cart/guest', {
      method: 'POST',
      data,
    });
  },

  /**
   * Merge guest cart into user cart upon login (Authenticated)
   */
  mergeCart: async (guestSessionId: string): Promise<CartResponse> => {
    return api<CartResponse>('cart/merge', {
      method: 'POST',
      data: { guestSessionId },
    });
  },
};
