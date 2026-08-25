"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, Star } from 'lucide-react';
import styles from './BestSellers.module.css';
import { CATALOG_PRODUCTS } from '@/data/categoryData';

export function BestSellers() {
  // Take 4 products that might be considered "best sellers"
  const bestSellers = CATALOG_PRODUCTS.slice(0, 4);

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>Crowd Favorites</span>
            <h2 className={styles.title}>Best Sellers</h2>
          </div>
          <Link href="/shop" className={styles.viewAllLink}>
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.grid}>
          {bestSellers.map(product => {
            const rating = product.rating || 4.8;
            const reviewsCount = product.reviewsCount || 128;
            return (
            <Link href={`/product/${product.id}`} key={product.id} className={styles.productCardLink}>
              <div className={styles.productCard}>
                <div className={styles.cardImageWrapper}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={styles.cardImage}
                    style={{ objectFit: 'contain' }}
                  />
                  {product.badge && (
                    <span
                      className={`${styles.cardBadge} ${
                        product.badge === 'New'
                          ? styles.badgeInk
                          : product.badge === 'Organic'
                          ? styles.badgeForest
                          : styles.badgeAmber
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                  <button 
                    className={styles.cardWishlistBtn} 
                    aria-label="Add to wishlist"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Heart size={18} color="#111" className={styles.wishlistIcon} />
                  </button>
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  <div className={styles.cardRatingRow}>
                    <Star size={14} fill="#E7A03B" color="#E7A03B" strokeWidth={1} />
                    <span className={styles.cardRatingText}>{rating} ({reviewsCount})</span>
                  </div>
                  <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
