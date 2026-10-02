"use client";

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Heart, Filter } from 'lucide-react';
import styles from './wishlist.module.css';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import { useWishlist } from '@/context/WishlistContext';

function AccountWishlistContent() {
  const { wishlistItems, loading, removeFromWishlist, moveAllToCart } = useWishlist();
  const [movingToCart, setMovingToCart] = useState(false);

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    setMovingToCart(true);
    try {
      await moveAllToCart();
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
          <Button variant="primary" onClick={handleMoveAllToCart} disabled={movingToCart || wishlistItems.length === 0}>
            {movingToCart ? "Moving..." : "Add All to Cart"}
          </Button>
        </div>
      </div>

      {loading && wishlistItems.length === 0 ? (
        <div className={styles.grid}>
          <Skeleton style={{ height: 120, borderRadius: 16 }} />
          <Skeleton style={{ height: 120, borderRadius: 16 }} />
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className={styles.grid}>
          {wishlistItems.map(item => {
            const product = item.product || {};
            const variant = item.variant;
            
            const activeImg = variant?.imageUrl || (variant?.images && variant.images[0]) || product.image || (product.images && product.images[0]) || '/hero-products/dog_food.png';
            
            // Build accurate product title with variant specification
            let displayName = product.name || 'Product';
            if (variant) {
              if (variant.name && !displayName.toLowerCase().includes(variant.name.toLowerCase())) {
                displayName = `${displayName} – ${variant.name}`;
              } else if (variant.attributes && typeof variant.attributes === 'object') {
                const vals = Object.values(variant.attributes).filter(Boolean);
                if (vals.length > 0 && !displayName.toLowerCase().includes(String(vals[0]).toLowerCase())) {
                  displayName = `${displayName} – ${vals[0]}`;
                }
              }
            }

            const effectivePrice = variant
              ? (variant.discountPrice && variant.discountPrice > 0 ? variant.discountPrice : variant.price)
              : (product.price || 0);

            const originalPrice = variant
              ? (variant.originalPrice || (variant.discountPrice && variant.discountPrice > 0 ? variant.price : undefined))
              : product.originalPrice;

            const productData = {
              id: item.productId,
              name: displayName,
              price: effectivePrice,
              originalPrice: originalPrice,
              rating: product.rating ?? 5,
              reviewsCount: product.reviewsCount ?? 0,
              image: activeImg,
              mainCategory: product.category?.name || product.mainCategory || 'Pet Foods',
              brand: product.brand || 'KickAt',
              badge: product.badge,
              stock: variant ? variant.stock : (product.stock ?? 1),
              type: product.type || (item.variantId ? 'VARIABLE' : 'SIMPLE'),
              variantId: item.variantId || undefined,
              selectedVariantId: item.variantId || undefined,
              variantName: variant?.name,
              isWishlisted: true,
            };

            return (
              <ProductCard 
                key={item.id} 
                product={productData as any} 
                onRemoveFromWishlist={() => removeFromWishlist(item.productId, item.variantId || undefined)} 
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
