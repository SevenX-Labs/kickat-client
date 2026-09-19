"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Heart, Filter, ChevronDown } from 'lucide-react';
import styles from './wishlist.module.css';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import { CATALOG_PRODUCTS } from '@/data/categoryData';

const MOCK_WISHLIST = CATALOG_PRODUCTS.slice(0, 5);

function AccountWishlistContent() {
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);
  const [loading, setLoading] = useState(false);

  const handleRemove = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
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
          <Button variant="primary">Add All to Cart</Button>
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
          {wishlistItems.map(product => (
            <ProductCard key={product.id} product={product as any} onRemoveFromWishlist={handleRemove} />
          ))}
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
