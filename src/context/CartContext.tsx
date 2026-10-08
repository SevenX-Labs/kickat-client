"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartService } from '@/services/cartService';
import { CartResponse, CartItem, CartSummary, BuyNowResponse } from '@/types/cart';
import { useAuth } from '@/context/AuthContext';

export interface CartContextType {
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
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a strict RFC 4122 v4 UUID
 */
const generateUUIDv4 = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Retrieve stored guestSessionId only if it is a valid UUID v4
 */
const getStoredGuestSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(GUEST_SESSION_KEY);
  if (stored && UUID_V4_REGEX.test(stored)) {
    return stored;
  }
  if (stored) {
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
  return null;
};

/**
 * Get or create a valid UUID v4 guestSessionId and persist to localStorage
 */
const getOrCreateGuestSessionId = (): string => {
  if (typeof window === 'undefined') return generateUUIDv4();
  const validStored = getStoredGuestSessionId();
  if (validStored) return validStored;
  const newId = generateUUIDv4();
  localStorage.setItem(GUEST_SESSION_KEY, newId);
  return newId;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  const isMergingRef = useRef<boolean>(false);
  const wasAuthenticatedRef = useRef<boolean>(isAuthenticated);

  // Initialize Guest Session ID on client mount if previously active
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = getStoredGuestSessionId();
      setGuestSessionId(storedId);
    }
  }, []);

  // Fetch cart data from backend
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        // Authenticated user: fetch persistent server cart
        const res = await cartService.getCart();
        setCart(res);
      } else {
        // Guest user: fetch guest cart only if an active session exists
        const storedId = getStoredGuestSessionId();
        if (storedId) {
          const res = await cartService.getGuestCart(storedId);
          setCart(res);
          setGuestSessionId(storedId);
        } else {
          // Clean empty cart state without making unnecessary network requests
          setCart({
            success: true,
            summary: {
              itemCount: 0,
              subtotal: 0,
              productDiscount: 0,
              deliveryFee: 0,
              taxAmount: 0,
              totalAmount: 0,
            },
            items: [],
          });
          setGuestSessionId(null);
        }
      }
    } catch (err: any) {
      console.warn('[CartContext] Failed to fetch cart:', err);
      setError(err?.message || 'Failed to load cart');
      if (!isAuthenticated) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(GUEST_SESSION_KEY);
        }
        setGuestSessionId(null);
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Handle guest cart merging upon login & cart reset on logout
  useEffect(() => {
    if (authLoading) return;

    const handleAuthSync = async () => {
      // Transition: User logged out -> immediately clear cart data to avoid exposure
      if (!isAuthenticated && wasAuthenticatedRef.current) {
        wasAuthenticatedRef.current = false;
        setCart(null);
        setGuestSessionId(null);
        await fetchCart();
        return;
      }

      // Transition: User logged in -> check for active guest cart to merge
      if (isAuthenticated && !wasAuthenticatedRef.current) {
        wasAuthenticatedRef.current = true;
        const storedGuestId = getStoredGuestSessionId();

        if (storedGuestId && !isMergingRef.current) {
          isMergingRef.current = true;
          try {
            // Verify guest cart has items before triggering merge API
            const guestCart = await cartService.getGuestCart(storedGuestId).catch(() => null);
            if (guestCart && guestCart.items && guestCart.items.length > 0) {
              const mergedCart = await cartService.mergeCart(storedGuestId);
              setCart(mergedCart);
            }
          } catch (mergeErr: any) {
            console.warn('[CartContext] Guest cart merge warning:', mergeErr);
          } finally {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(GUEST_SESSION_KEY);
            }
            setGuestSessionId(null);
            isMergingRef.current = false;
          }
        }
        await fetchCart();
        return;
      }

      // Initial mount or stable auth state
      wasAuthenticatedRef.current = isAuthenticated;
      await fetchCart();
    };

    handleAuthSync();
  }, [isAuthenticated, authLoading, fetchCart]);

  // Add Item to Cart (Auth or Guest)
  const isAddingToCartRef = useRef<boolean>(false);
  const addToCart = async (productId: string, variantId?: string, quantity: number = 1) => {
    if (quantity <= 0) return;
    if (isAddingToCartRef.current) return;
    isAddingToCartRef.current = true;
    setIsUpdating(true);
    setError(null);
    try {
      let updatedCart: CartResponse;
      if (isAuthenticated) {
        updatedCart = await cartService.addCartItem(productId, variantId, quantity);
      } else {
        const sessionId = getOrCreateGuestSessionId();
        setGuestSessionId(sessionId);
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
      isAddingToCartRef.current = false;
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
        if (!existingItem) return;

        const currentGuestSessionId = getStoredGuestSessionId();
        if (!currentGuestSessionId) return;

        const delta = quantity - existingItem.quantity;
        if (delta > 0) {
          // Increase: Call addGuestCartItem with positive delta
          const updatedCart = await cartService.addGuestCartItem(
            currentGuestSessionId,
            existingItem.productId,
            existingItem.variantId || undefined,
            delta
          );
          setCart(updatedCart);
        } else if (delta < 0) {
          // Decrease: Rotate to a fresh session with updated quantities
          // Keeps backend database 100% authoritative and in sync
          const remainingItems = cart!.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const freshSessionId = generateUUIDv4();
          if (typeof window !== 'undefined') {
            localStorage.setItem(GUEST_SESSION_KEY, freshSessionId);
          }
          setGuestSessionId(freshSessionId);

          let finalCart: CartResponse | null = null;
          for (const item of remainingItems) {
            finalCart = await cartService.addGuestCartItem(
              freshSessionId,
              item.productId,
              item.variantId || undefined,
              item.quantity
            );
          }
          if (finalCart) {
            setCart(finalCart);
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
        // Guest user remove item:
        // Rotate to a fresh session containing only remaining items
        const remainingItems = (cart?.items || []).filter((item) => item.id !== itemId);
        if (remainingItems.length === 0) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(GUEST_SESSION_KEY);
          }
          setGuestSessionId(null);
          setCart({
            success: true,
            summary: {
              itemCount: 0,
              subtotal: 0,
              productDiscount: 0,
              deliveryFee: 0,
              taxAmount: 0,
              totalAmount: 0,
            },
            items: [],
          });
        } else {
          const freshSessionId = generateUUIDv4();
          if (typeof window !== 'undefined') {
            localStorage.setItem(GUEST_SESSION_KEY, freshSessionId);
          }
          setGuestSessionId(freshSessionId);

          let finalCart: CartResponse | null = null;
          for (const item of remainingItems) {
            finalCart = await cartService.addGuestCartItem(
              freshSessionId,
              item.productId,
              item.variantId || undefined,
              item.quantity
            );
          }
          if (finalCart) {
            setCart(finalCart);
          }
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
