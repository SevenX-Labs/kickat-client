'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart, Trash2, Truck } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  mainCategory: string;
  subCategory: string;
  brand?: string;
  badge?: string;
  tags?: string[];
  sizes?: string[];
  color?: string;
  isTopRated?: boolean;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onRemoveFromWishlist?: (id: string) => void;
}

const defaultSwatches = ['#FD802E', '#F0E6D8', '#6B7280', '#2D2D2D'];

const productDescriptions: Record<string, string> = {
  'd-1': 'Grain-free organic kibble formulated for optimal nutrition, digestion, and coat health.',
  'd-2': 'Heavyweight ceramic bowl with non-slip base, durable and dishwasher safe.',
  'd-3': 'Durable natural rubber chew toy designed for teething and active daily play.',
  'd-4': 'Reflective padded harness & leash set for safe, comfortable night walks.',
  'c-1': 'Wild salmon & tuna crunch treats packed with natural omega-3 fatty acids.',
  'c-2': 'Interactive spinning feather toy with USB rechargeable smart motor.',
  'c-3': 'Natural clumping tofu cat litter, 100% dust-free, flushable, and odor controlling.',
  'c-4': 'Whisker-friendly shallow ceramic dish designed for stress-free daily feeding.',
};

function getDescription(product: Product): string {
  return product.description || productDescriptions[product.id] || (product.tags && product.tags.length > 0 ? product.tags.join(' · ') : 'Premium quality pet essential curated for health & comfort.');
}

export default function ProductCard({ product, onRemoveFromWishlist }: ProductCardProps) {
  const [selectedSwatch, setSelectedSwatch] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;
  
  // Calculate discount percentage if originalPrice exists
  const discountPercent = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.badge === 'Sale' ? 15 : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
    } else {
      setIsWishlisted((prev) => !prev);
    }
  };

  return (
    <div className={styles.productCard}>
      {/* Product Image Area */}
      <div className={styles.cardImageArea}>
        {product.badge && (
          <span className={styles.cardBadge}>
            {product.badge === 'Popular' || product.badge === 'Best Seller'
              ? 'BESTSELLER'
              : product.badge === 'New' || product.badge === 'New Arrival'
              ? 'NEW'
              : product.badge === 'Sale'
              ? 'SALE'
              : product.badge.toUpperCase()}
          </span>
        )}

        {/* Mobile-only Wishlist Button (absolute over image for 2-col layout) */}
        {onRemoveFromWishlist ? (
          <button 
            className={styles.cardRemoveBtn} 
            aria-label="Remove from wishlist"
            onClick={handleWishlistClick}
          >
            <Trash2 size={15} strokeWidth={2} color="#C34A42" />
          </button>
        ) : (
          <button 
            className={`${styles.cardWishlistBtn} ${isWishlisted ? styles.wishlistedActive : ''}`} 
            aria-label="Add to wishlist"
            onClick={handleWishlistClick}
          >
            <Heart
              size={15}
              className={isWishlisted ? styles.heartFilled : ''}
              strokeWidth={2}
            />
          </button>
        )}

        <Link href={`/product/${product.id}`} className={styles.cardImageLink}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className={styles.cardImage}
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* Middle Details Column */}
      <div className={styles.cardInfo}>
        <Link href={`/product/${product.id}`} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>
        
        {/* Rating Row */}
        <div className={styles.cardRatingRow}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={13} 
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
          {discountPercent && (
            <span className={styles.discountTag}>{discountPercent}% OFF</span>
          )}
        </div>

        {/* Variant Selector Color Swatches */}
        <div className={styles.colorSwatches}>
          {defaultSwatches.map((color, idx) => (
            <span
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedSwatch(idx);
              }}
              className={`${styles.swatchDot} ${selectedSwatch === idx ? styles.swatchActive : ''}`}
              style={{ backgroundColor: color }}
              aria-label={`Select variant ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Vertical Divider */}
      <div className={styles.desktopDivider} />

      {/* Action Column */}
      <div className={styles.cardActionCol}>
        <div className={styles.rightActionsRow}>
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
            <span className={styles.btnText}>Add to Cart</span>
          </button>

          {/* Wishlist Button in Action Row */}
          <button 
            className={`${styles.desktopWishlistBtn} ${isWishlisted ? styles.wishlistedActive : ''}`} 
            aria-label="Add to wishlist"
            onClick={handleWishlistClick}
          >
            <Heart
              size={18}
              className={isWishlisted ? styles.heartFilled : ''}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* In Stock Indicator & Delivery Subtitle */}
        <div className={styles.stockDeliveryGroup}>
          <div className={styles.inStockBadge}>
            <span className={styles.greenPulseDot} />
            <Truck size={13} className={styles.truckIcon} />
            <span>In Stock</span>
          </div>
          <span className={styles.deliveryText}>· Delivery Tomorrow</span>
        </div>
      </div>
    </div>
  );
}
