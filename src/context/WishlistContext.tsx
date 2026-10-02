'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService, WishlistItem } from '@/services/wishlistService';

interface ToggleProductParam {
  id: string;
  type?: 'SIMPLE' | 'VARIABLE' | string;
  variants?: any[];
  variantId?: string;
  selectedVariantId?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  isWishlisted: (productId: string, variantId?: string) => boolean;
  toggleWishlist: (product: ToggleProductParam, activeVariantId?: string) => Promise<boolean>;
  removeFromWishlist: (productId: string, variantId?: string) => Promise<void>;
  moveAllToCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const isOperatingRef = useRef(false);

  // Helper to build Set of IDs from Wishlist items
  const buildIdsSet = (items: WishlistItem[]): Set<string> => {
    const ids = new Set<string>();
    items.forEach((item) => {
      if (item.productId) {
        ids.add(item.productId);
        if (item.variantId) {
          ids.add(`${item.productId}_${item.variantId}`);
        }
      }
    });
    return ids;
  };

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getWishlist(1, 100);
      if (res.success && Array.isArray(res.items)) {
        setWishlistItems(res.items);
        setWishlistIds(buildIdsSet(res.items));
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // Listen to global wishlist-updated events across windows / tabs
  useEffect(() => {
    const handleGlobalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId: string; action: 'add' | 'remove'; variantId?: string }>;
      if (customEvent.detail && customEvent.detail.productId) {
        const { productId, action, variantId } = customEvent.detail;
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (action === 'add') {
            next.add(productId);
            if (variantId) next.add(`${productId}_${variantId}`);
          } else {
            next.delete(productId);
            if (variantId) next.delete(`${productId}_${variantId}`);
          }
          return next;
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('wishlist-updated', handleGlobalUpdate);
      return () => window.removeEventListener('wishlist-updated', handleGlobalUpdate);
    }
  }, []);

  const isWishlisted = useCallback(
    (productId: string, variantId?: string): boolean => {
      if (!productId) return false;
      if (variantId) {
        return wishlistIds.has(`${productId}_${variantId}`) || wishlistIds.has(productId);
      }
      return wishlistIds.has(productId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (product: ToggleProductParam, activeVariantId?: string): Promise<boolean> => {
      if (!product || !product.id) return false;

      // Determine product type
      const isVariable =
        product.type === 'VARIABLE' || (Array.isArray(product.variants) && product.variants.length > 0);
      const variantIdToUse = isVariable
        ? activeVariantId ||
          product.variantId ||
          product.selectedVariantId ||
          (product.variants && product.variants[0]?.id)
        : undefined;

      const currentStatus = isWishlisted(product.id, variantIdToUse);
      const nextStatus = !currentStatus;

      // Instant optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (nextStatus) {
          next.add(product.id);
          if (variantIdToUse) next.add(`${product.id}_${variantIdToUse}`);
        } else {
          next.delete(product.id);
          if (variantIdToUse) next.delete(`${product.id}_${variantIdToUse}`);
        }
        return next;
      });

      if (!nextStatus) {
        setWishlistItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.productId === product.id &&
                (item.variantId || null) === (variantIdToUse || null)
              )
          )
        );
      }

      try {
        if (nextStatus) {
          await wishlistService.addToWishlist(product.id, variantIdToUse);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('wishlist-updated', {
                detail: { productId: product.id, action: 'add', variantId: variantIdToUse },
              })
            );
          }
          // Fetch updated list in background to sync full WishlistItem records
          wishlistService.getWishlist(1, 100).then((res) => {
            if (res.success && Array.isArray(res.items)) {
              setWishlistItems(res.items);
              setWishlistIds(buildIdsSet(res.items));
            }
          }).catch(() => {});
        } else {
          await wishlistService.removeFromWishlist(product.id, variantIdToUse);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('wishlist-updated', {
                detail: { productId: product.id, action: 'remove', variantId: variantIdToUse },
              })
            );
          }
        }
        return nextStatus;
      } catch (err: any) {
        console.error('Failed to toggle wishlist:', err);
        const msg = (err?.message || '').toLowerCase();

        // Handle conflict or already removed gracefully without reverting valid UI state
        if (nextStatus && (msg.includes('already in wishlist') || msg.includes('conflict') || msg.includes('409'))) {
          setWishlistIds((prev) => new Set(prev).add(product.id));
          return true;
        } else if (!nextStatus && (msg.includes('not in wishlist') || msg.includes('not found') || msg.includes('404'))) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          return false;
        }

        // Revert optimistic update on unexpected network/auth failure
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (currentStatus) {
            next.add(product.id);
            if (variantIdToUse) next.add(`${product.id}_${variantIdToUse}`);
          } else {
            next.delete(product.id);
            if (variantIdToUse) next.delete(`${product.id}_${variantIdToUse}`);
          }
          return next;
        });
        return currentStatus;
      }
    },
    [isWishlisted]
  );

  const removeFromWishlist = useCallback(
    async (productId: string, variantId?: string) => {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        if (variantId) next.delete(`${productId}_${variantId}`);
        return next;
      });

      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && (item.variantId || null) === (variantId || null))
        )
      );

      try {
        await wishlistService.removeFromWishlist(productId, variantId);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wishlist-updated', {
              detail: { productId, action: 'remove', variantId },
            })
          );
        }
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
        refreshWishlist();
      }
    },
    [refreshWishlist]
  );

  const moveAllToCart = useCallback(async () => {
    if (wishlistItems.length === 0) return;
    try {
      await Promise.all(
        wishlistItems.map((item) =>
          wishlistService.moveToCart(item.productId, item.variantId || undefined, 1)
        )
      );
      setWishlistItems([]);
      setWishlistIds(new Set());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-items-added'));
      }
    } catch (err) {
      console.error('Failed to move items to cart:', err);
      refreshWishlist();
    }
  }, [wishlistItems, refreshWishlist]);

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      loading,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      moveAllToCart,
      refreshWishlist,
    }),
    [
      wishlistItems,
      loading,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      moveAllToCart,
      refreshWishlist,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
