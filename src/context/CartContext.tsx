"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '@/services/cartService';
import { CartResponse, CartItem, CartSummary, BuyNowResponse } from '@/types/cart';

interface CartContextType {
  cart: CartResponse | null;
  items: CartItem[];
  summary: CartSummary | null;
  cartCount: number;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  guestSessionId: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  buyNow: (productId: string, variantId?: string, quantity?: number) => Promise<BuyNowResponse>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_SESSION_KEY = 'kickat_guest_cart_session_id';

const getOrCreateGuestSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Initialize Guest Session ID on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getOrCreateGuestSessionId();
      setGuestSessionId(sessionId);
    }
  }, []);

  // Fetch cart data from backend
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        // Authenticated user: fetch persistent cart
        const res = await cartService.getCart();
        setCart(res);
      } else {
        // Guest user: fetch guest cart by sessionId
        const sessionId = getOrCreateGuestSessionId();
        if (sessionId) {
          const res = await cartService.getGuestCart(sessionId);
          setCart(res);
        }
      }
    } catch (err: any) {
      console.warn('[CartContext] Failed to fetch cart:', err);
      setError(err?.message || 'Failed to load cart');
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Handle guest cart merging upon login
  useEffect(() => {
    if (authLoading) return;

    const handleAuthSync = async () => {
      if (isAuthenticated) {
        const storedGuestId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_SESSION_KEY) : null;
        if (storedGuestId) {
          try {
            // Merge guest cart items into authenticated user cart
            await cartService.mergeCart(storedGuestId);
          } catch (mergeErr) {
            console.warn('[CartContext] Guest cart merge warning:', mergeErr);
          } finally {
            localStorage.removeItem(GUEST_SESSION_KEY);
          }
        }
      }
      await fetchCart();
    };

    handleAuthSync();
  }, [isAuthenticated, authLoading, fetchCart]);

  // Add Item to Cart (Auth or Guest)
  const addToCart = async (productId: string, variantId?: string, quantity: number = 1) => {
    setIsUpdating(true);
    setError(null);
    try {
      let updatedCart: CartResponse;
      if (isAuthenticated) {
        updatedCart = await cartService.addCartItem(productId, variantId, quantity);
      } else {
        const sessionId = getOrCreateGuestSessionId();
        updatedCart = await cartService.addGuestCartItem(sessionId, productId, variantId, quantity);
      }
      setCart(updatedCart);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-item-added'));
      }
    } catch (err: any) {
      console.error('[CartContext] Add to cart failed:', err);
      setError(err?.message || 'Could not add item to cart');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update Item Quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    setIsUpdating(true);
    setError(null);
    try {
      if (isAuthenticated) {
        const updatedCart = await cartService.updateCartItem(itemId, quantity);
        setCart(updatedCart);
      } else {
        // Guest user item quantity update
        const existingItem = cart?.items.find((i) => i.id === itemId);
        if (existingItem) {
          const delta = quantity - existingItem.quantity;
          const sessionId = getOrCreateGuestSessionId();
          if (delta > 0) {
            const updatedCart = await cartService.addGuestCartItem(sessionId, existingItem.productId, existingItem.variantId || undefined, delta);
            setCart(updatedCart);
          } else {
            // If delta < 0 in guest mode, update local items representation
            const updatedItems = cart!.items.map((item) =>
              item.id === itemId ? { ...item, quantity, totalPrice: item.unitPrice * quantity } : item
            );
            const subtotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);
            const itemCount = updatedItems.reduce((acc, i) => acc + i.quantity, 0);

            setCart({
              ...cart!,
              items: updatedItems,
              summary: {
                ...cart!.summary,
                itemCount,
                subtotal,
                totalAmount: subtotal + (cart!.summary.taxAmount || 0) + (cart!.summary.deliveryFee || 0),
              },
            });
          }
        }
      }
    } catch (err: any) {
      console.error('[CartContext] Update quantity failed:', err);
      setError(err?.message || 'Failed to update item quantity');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove Item from Cart
  const removeItem = async (itemId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      if (isAuthenticated) {
        await cartService.removeCartItem(itemId);
        await fetchCart();
      } else {
        // Guest user remove item
        if (cart) {
          const updatedItems = cart.items.filter((item) => item.id !== itemId);
          const subtotal = updatedItems.reduce((acc, i) => acc + i.totalPrice, 0);
          const itemCount = updatedItems.reduce((acc, i) => acc + i.quantity, 0);

          setCart({
            ...cart,
            items: updatedItems,
            summary: {
              ...cart.summary,
              itemCount,
              subtotal,
              totalAmount: subtotal + (cart.summary.taxAmount || 0) + (cart.summary.deliveryFee || 0),
            },
          });
        }
      }
    } catch (err: any) {
      console.error('[CartContext] Remove item failed:', err);
      setError(err?.message || 'Failed to remove item');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Direct Buy-Now Checkout
  const buyNow = async (productId: string, variantId?: string, quantity: number = 1): Promise<BuyNowResponse> => {
    setIsUpdating(true);
    setError(null);
    try {
      return await cartService.buyNow(productId, variantId, quantity);
    } catch (err: any) {
      console.error('[CartContext] Buy now failed:', err);
      setError(err?.message || 'Buy now failed');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const cartCount = cart?.summary?.itemCount ?? cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const items = cart?.items ?? [];
  const summary = cart?.summary ?? null;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        summary,
        cartCount,
        isLoading,
        isUpdating,
        error,
        guestSessionId,
        refreshCart: fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        buyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
