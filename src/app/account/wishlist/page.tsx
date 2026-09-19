"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import styles from './wishlist.module.css';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import { wishlistService, WishlistItem } from '@/services/wishlistService';
import { useEffect } from 'react';

function AccountWishlistContent() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await wishlistService.getWishlist();
        if (res.success && res.items) {
          setWishlistItems(res.items);
        }
      } catch (err) {
        console.error('Failed to load wishlist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await wishlistService.removeFromWishlist(id);
      setWishlistItems(prev => prev.filter(item => item.productId !== id));
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const [movingToCart, setMovingToCart] = useState(false);
  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    setMovingToCart(true);
    try {
      // Execute all move-to-cart operations in parallel
      await Promise.all(
        wishlistItems.map(item => wishlistService.moveToCart(item.productId, item.variantId || undefined, 1))
      );
      // Remove all items from local state since they are moved to cart
      setWishlistItems([]);
      window.dispatchEvent(new CustomEvent('cart-items-added'));
    } catch (err) {
      console.error('Failed to move items to cart', err);
    } finally {
      setMovingToCart(false);
    }
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageH1}>My Wishlist</h1>
          <p className={styles.pageSubtitle}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for your furry companions
          </p>
        </div>
        <div className={styles.wishlistActions}>
          <Button variant="secondary" icon={<Filter size={16} />}>Sort</Button>
          <Button variant="primary" onClick={handleMoveAllToCart} disabled={movingToCart || wishlistItems.length === 0}>{movingToCart ? "Moving..." : "Add All to Cart"}</Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          <Skeleton style={{ height: 320 }} />
          <Skeleton style={{ height: 320 }} />
          <Skeleton style={{ height: 320 }} />
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className={styles.grid}>
          {wishlistItems.map(item => {
            const productData = {
              ...item.product,
              id: item.productId // Ensure ProductCard uses productId for removal
            };
            return (
              <ProductCard 
                key={item.id} 
                product={productData as any} 
                onRemoveFromWishlist={() => handleRemove(item.productId)} 
              />
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={<Heart size={48} />}
          title="Your wishlist is empty"
          description="Looks like you haven't saved any items yet. Explore our premium collection!"
          action={<Link href="/shop"><Button variant="primary">Start Shopping</Button></Link>}
        />
      )}
    </div>
  );
}

export default function AccountWishlistPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <AccountWishlistContent />
    </Suspense>
  );
}
