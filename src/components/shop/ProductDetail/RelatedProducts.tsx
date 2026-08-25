"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, Star } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';
import { CATALOG_PRODUCTS } from '@/data/categoryData';

interface RelatedProductsProps {
  currentProduct: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  // Get up to 4 products from the same main category, excluding current
  const related = CATALOG_PRODUCTS
    .filter(p => p.mainCategory === currentProduct.mainCategory && p.id !== currentProduct.id)
    .slice(0, 4);

  const productsToDisplay = related;

  return (
    <div className={styles.relatedSectionWrapper}>
      <div className={styles.relatedHeader}>
        <div className={styles.relatedHeaderLeft}>
          <span className={styles.relatedEyebrow}>Pairs well with</span>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
        </div>
        <Link href="/shop" className={styles.viewAllLink}>
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div className={styles.relatedGrid}>
        {productsToDisplay.map(product => {
          const rating = product.rating || 4.8;
          const reviewsCount = product.reviewsCount || 128;
          return (
          <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }} className={styles.productCardLink}>
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
                  <Star size={14} fill="none" color="#E7A03B" strokeWidth={2.5} />
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
  );
}
