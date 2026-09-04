'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, Trash2 } from 'lucide-react';
import styles from './HomeProductCard.module.css';

export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  mainCategory?: string;
  subCategory?: string;
  brand?: string;
  badge?: string;
  description?: string;
}

interface HomeProductCardProps {
  product: HomeProduct;
  onRemoveFromWishlist?: (id: string) => void;
}

export default function HomeProductCard({ product, onRemoveFromWishlist }: HomeProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;

  // Calculate discount percentage
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.badge === 'Sale' ? 25 : 20;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
    } else {
      setIsWishlisted((prev) => !prev);
    }
  };

  const getBadgeText = () => {
    if (!product.badge) return 'Best Seller';
    if (product.badge === 'Popular' || product.badge === 'Best Seller') return 'Best Seller';
    if (product.badge === 'New' || product.badge === 'New Arrival') return 'New';
    if (product.badge === 'Sale') return `${discountPercent}% OFF`;
    return product.badge;
  };

  return (
    <div className={styles.homeCard}>
      {/* Top Image Area */}
      <div className={styles.cardImageArea}>
        <span className={styles.cardBadge}>{getBadgeText()}</span>

        <button
          className={`${styles.cardWishlistBtn} ${isWishlisted ? styles.wishlistedActive : ''}`}
          aria-label="Add to wishlist"
          onClick={handleWishlistClick}
        >
          <Heart
            size={15}
            className={isWishlisted ? styles.heartFilled : ''}
            strokeWidth={2}
            color={isWishlisted ? '#FD802E' : '#111827'}
          />
        </button>

        <Link href={`/product/${product.id}`} className={styles.cardImageLink}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className={styles.cardImage}
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </div>

      {/* Content Block */}
      <div className={styles.cardContent}>
        <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>

        {/* Rating Row */}
        <div className={styles.cardRatingRow}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                fill={star <= Math.floor(rating) ? "#FD802E" : star - rating < 1 ? "#FD802E" : "#E5E7EB"}
                color={star <= Math.floor(rating) ? "#FD802E" : star - rating < 1 ? "#FD802E" : "#E5E7EB"}
                strokeWidth={0}
              />
            ))}
          </div>
          <span className={styles.cardRatingScore}>{rating.toFixed(1)}</span>
          <span className={styles.cardReviewsCount}>({reviewsCount})</span>
        </div>

        {/* Price Row */}
        <div className={styles.priceContainer}>
          <div className={styles.priceRowUpper}>
            <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <span className={styles.discountTag}>{discountPercent}% OFF</span>
        </div>

        {/* Add to Cart Button */}
        <button
          className={styles.addToCartBtn}
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert(`Added ${product.name} to cart!`);
          }}
        >
          <ShoppingCart size={15} color="#ffffff" strokeWidth={2.2} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
