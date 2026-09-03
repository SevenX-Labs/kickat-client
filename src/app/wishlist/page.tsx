"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import styles from './wishlist.module.css';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import ProductCard from '@/components/common/ProductCard/ProductCard';

// Mock wishlist data using the first 5 products from CATALOG_PRODUCTS
const MOCK_WISHLIST = CATALOG_PRODUCTS.slice(0, 5);

export default function WishlistPage() {
  // Using state to allow removing items for interactivity
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);

  const handleRemove = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>My Wishlist</h1>
            <p className={styles.subtitle}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          <div className={styles.grid}>
            {wishlistItems.map(product => (
              <div key={product.id} className={styles.productCardWrapper}>
                <ProductCard product={product as any} onRemoveFromWishlist={handleRemove} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Heart size={40} fill="#E7A03B" strokeWidth={0} />
            </div>
            <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
            <p className={styles.emptyDesc}>
              Looks like you haven&apos;t saved any items yet. Explore our premium collection and save your favorites!
            </p>
            <Link href="/shop" className={styles.shopBtn}>
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
