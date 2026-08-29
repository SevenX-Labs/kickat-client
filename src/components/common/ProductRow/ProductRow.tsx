"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, Star, ShoppingCart, PawPrint } from 'lucide-react';
import styles from './ProductRow.module.css';

import { CatalogProduct } from '@/data/categoryData';

type Product = CatalogProduct;

export interface ProductRowProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: 'cream' | 'white';
}

// Short description map for products
const productDescriptions: Record<string, string> = {
  'd-1': 'Grain-free organic kibble for a healthier, happier pup.',
  'd-2': 'Heavy ceramic bowl with non-slip grip, dishwasher safe.',
  'd-3': 'Durable natural rubber toy perfect for teething puppies.',
  'd-4': 'Reflective padded harness for safe nighttime walks.',
  'c-1': 'Wild salmon & tuna treats cats go crazy for.',
  'c-2': 'Spinning feather toy with USB rechargeable motor.',
  'c-3': 'Natural tofu clumping litter, dust-free & flushable.',
  'c-4': 'Whisker-friendly shallow dish for comfortable feeding.',
};

function getDescription(product: Product): string {
  return productDescriptions[product.id] || product.tags?.slice(0, 2).join(' · ') || 'Premium quality pet essential.';
}

export function ProductRow({ eyebrow, title, subtitle, products, viewAllLink = '/shop', backgroundColor = 'cream' }: ProductRowProps) {
  const displayProducts = products.slice(0, 4);
  const bgClass = backgroundColor === 'white' ? styles.bgWhite : styles.bgCream;

  return (
    <section className={`${styles.sectionWrapper} ${bgClass}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrowWrapper}>
              {eyebrow.toUpperCase().includes('CROWD') && <PawPrint size={14} fill="currentColor" strokeWidth={0} />}
              <span className={styles.eyebrow}>{eyebrow}</span>
            </div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {!subtitle && eyebrow.toUpperCase().includes('CROWD') && (
              <p className={styles.subtitle}>Handpicked essentials that pets love and pet parents trust.</p>
            )}
          </div>
          <Link href={viewAllLink} className={styles.viewAllBtn}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {displayProducts.map(product => {
            const rating = product.rating || 4.8;
            const reviewsCount = product.reviewsCount || 128;
            const description = getDescription(product);
            return (
            <div key={product.id} className={styles.productCard}>
              {/* Image area */}
              <div className={styles.cardImageArea}>
                {product.badge && (
                  <span className={`${styles.cardBadge} ${
                    product.badge === 'Popular' || product.badge === 'Best Seller' ? styles.badgeGreen : 
                    product.badge === 'New' ? styles.badgeBrown : 
                    product.badge === 'Sale' || product.badge.includes('%') ? styles.badgeRed : styles.badgeGreen
                  }`}>
                    {product.badge === 'Popular' ? 'BEST SELLER' : product.badge === 'New' ? 'NEW ARRIVAL' : product.badge === 'Sale' ? 'SALE 15% OFF' : product.badge.toUpperCase()}
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
                  <Heart size={16} color="#666" strokeWidth={1.5} />
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

              {/* Info area */}
              <div className={styles.cardInfo}>
                <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                </Link>
                <p className={styles.cardDescription}>{description}</p>
                
                <div className={styles.cardRatingRow}>
                  <Star size={13} fill="#E7A03B" color="#E7A03B" strokeWidth={0} />
                  <span className={styles.cardRatingText}>{rating} ({reviewsCount})</span>
                  <span className={styles.ratingDivider}>|</span>
                  <span className={styles.happyParentsText}>2.2K+ Happy Parents</span>
                </div>
                
                <div className={styles.cardBottom}>
                  <div className={styles.priceContainer}>
                    <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <>
                        <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                        {product.badge === 'Sale' && <span className={styles.discountTag}>15% OFF</span>}
                      </>
                    )}
                  </div>
                  
                  <button 
                    className={`${styles.addToCartBtn} ${
                      product.badge === 'Popular' || product.badge === 'Best Seller' ? styles.cartBtnGreen : 
                      product.badge === 'New' ? styles.cartBtnBrown : 
                      product.badge === 'Sale' ? styles.cartBtnRed : styles.cartBtnGreen
                    }`}
                    aria-label="Add to cart"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <ShoppingCart size={16} color="#fff" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
