"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, Trash2 } from 'lucide-react';
import styles from './wishlist.module.css';
import { CATALOG_PRODUCTS } from '@/data/categoryData';

// Mock wishlist data using the first 5 products from CATALOG_PRODUCTS
const MOCK_WISHLIST = CATALOG_PRODUCTS.slice(0, 5);

export default function WishlistPage() {
  // Using state to allow removing items for interactivity
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Simulate add to cart
    alert('Added to cart!');
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
              <div key={product.id} className={styles.productCard}>
                <div className={styles.cardImageArea}>
                  <button 
                    className={styles.cardRemoveBtn} 
                    aria-label="Remove from wishlist"
                    onClick={(e) => handleRemove(e, product.id)}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                  <Link href={`/product/${product.id}`} className={styles.cardImageLink}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={styles.cardImage}
                      style={{ objectFit: 'contain' }}
                    />
                  </Link>
                </div>
                
                <div className={styles.cardInfo}>
                  <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
                    <h3 className={styles.cardTitle}>{product.name}</h3>
                  </Link>
                  <div className={styles.cardRatingRow}>
                    <Star size={13} fill="#E7A03B" color="#E7A03B" strokeWidth={0} />
                    <span className={styles.cardRatingText}>
                      {product.rating || 4.8} ({product.reviewsCount || 128})
                    </span>
                  </div>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
                    <button 
                      className={styles.addToCartBtn}
                      aria-label="Add to cart"
                      onClick={(e) => handleAddToCart(e, product.id)}
                    >
                      <ShoppingCart size={14} strokeWidth={2} />
                      Add to Cart
                    </button>
                  </div>
                </div>
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
              Looks like you haven't saved any items yet. Explore our premium collection and save your favorites!
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
