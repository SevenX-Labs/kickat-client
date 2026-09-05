"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Heart } from 'lucide-react';
import styles from './wishlist.module.css';
import accountStyles from '@/app/account/Account.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import ProductCard from '@/components/common/ProductCard/ProductCard';

const MOCK_WISHLIST = CATALOG_PRODUCTS.slice(0, 5);

function WishlistContent() {
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);

  const handleRemove = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={accountStyles.pageWrapper}>
      <main className={accountStyles.container}>
        <div className={accountStyles.accountLayout}>
          
          {/* Account Navigation */}
          <AccountSidebarNav />

          {/* Wishlist Main Content */}
          <div className={accountStyles.contentArea}>
            <div className={accountStyles.tabContentCard}>
              <div className={accountStyles.sectionHeader}>
                <h1 className={accountStyles.title}>My Wishlist</h1>
                <p className={accountStyles.subtitle}>
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for your furry companions
                </p>
              </div>

              {wishlistItems.length > 0 ? (
                <div className={styles.grid}>
                  {wishlistItems.map(product => (
                    <ProductCard key={product.id} product={product as any} onRemoveFromWishlist={handleRemove} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Heart size={40} fill="#FD802E" strokeWidth={0} />
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
          </div>

          {/* Right VIP Snapshot */}
          <aside className={accountStyles.statsPanel}>
            <div className={accountStyles.vipCardHeader}>
              <span className={accountStyles.vipCardTitle}>KICKAT REWARDS</span>
              <span className={accountStyles.vipTierTag}>Gold Paw VIP</span>
            </div>
            <div className={accountStyles.rewardsProgressBlock}>
              <div className={accountStyles.pointsDisplayRow}>
                <span className={accountStyles.pointsValue}>1,240</span>
                <span className={accountStyles.pointsLabel}>Available Paws</span>
              </div>
              <div className={accountStyles.tierProgressBarWrapper}>
                <div className={accountStyles.tierProgressBarFill} style={{ width: '62%' }}></div>
              </div>
              <div className={accountStyles.tierProgressText}>
                <span>620 pts earned</span>
                <span>260 pts to Platinum</span>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading wishlist...</div>}>
      <WishlistContent />
    </Suspense>
  );
}
