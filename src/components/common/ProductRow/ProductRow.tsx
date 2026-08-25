"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, Star } from 'lucide-react';
import styles from './ProductRow.module.css';

import { CatalogProduct } from '@/data/categoryData';

type Product = CatalogProduct;


export interface ProductRowProps {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: 'cream' | 'white';
}

export function ProductRow({ eyebrow, title, products, viewAllLink = '/shop', backgroundColor = 'cream' }: ProductRowProps) {
  // Take up to 4 products
  const displayProducts = products.slice(0, 4);
  const bgClass = backgroundColor === 'white' ? styles.bgWhite : styles.bgCream;

  return (
    <section className={`${styles.sectionWrapper} ${bgClass}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <Link href={viewAllLink} className={styles.viewAllLink}>
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.grid}>
          {displayProducts.map(product => {
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
