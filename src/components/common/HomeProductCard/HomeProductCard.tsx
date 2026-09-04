'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingCart, Trash2, Check } from 'lucide-react';
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
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      router.push('/cart');
      return;
    }

    const startElem = e.currentTarget as HTMLElement;
    const cartBtn = document.getElementById('navbar-cart-btn');
    const imageSrc = product.image || '/hero-products/dog_food.png';

    if (cartBtn) {
      const startRect = startElem.getBoundingClientRect();
      const endRect = cartBtn.getBoundingClientRect();

      const flyingImg = document.createElement('img');
      flyingImg.src = imageSrc;
      flyingImg.alt = 'Flying product preview';

      const width = 56;
      const height = 56;
      const startX = startRect.left + startRect.width / 2 - width / 2;
      const startY = startRect.top + startRect.height / 2 - height / 2;
      const endX = endRect.left + endRect.width / 2 - 20;
      const endY = endRect.top + endRect.height / 2 - 20;

      Object.assign(flyingImg.style, {
        position: 'fixed',
        top: `${startY}px`,
        left: `${startX}px`,
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover',
        borderRadius: '14px',
        boxShadow: '0 10px 25px rgba(253, 128, 46, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
        border: '2px solid #ffffff',
        zIndex: '99999',
        pointerEvents: 'none',
        backgroundColor: '#ffffff',
      });

      document.body.appendChild(flyingImg);

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      const animation = flyingImg.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)', opacity: 1 },
          { offset: 0.45, transform: `translate3d(${deltaX * 0.45}px, ${deltaY * 0.45 - 140}px, 0) scale(0.72) rotate(-12deg)`, opacity: 0.95 },
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.12) rotate(-30deg)`, opacity: 0.1 },
        ],
        {
          duration: 1800,
          easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
          fill: 'forwards',
        }
      );

      animation.onfinish = () => {
        flyingImg.remove();
        window.dispatchEvent(new CustomEvent('cart-item-added'));
      };
    } else {
      window.dispatchEvent(new CustomEvent('cart-item-added'));
    }

    setIsAdded(true);
  };

  const getBadgeText = () => {
    if (!product.badge || product.badge === 'Popular' || product.badge === 'Best Seller') {
      return null;
    }
    if (product.badge === 'New' || product.badge === 'New Arrival') return 'New';
    if (product.badge === 'Sale') return `${discountPercent}% OFF`;
    return product.badge;
  };

  const badgeText = getBadgeText();

  return (
    <div className={styles.homeCard}>
      {/* Top Image Area */}
      <div className={styles.cardImageArea}>
        {badgeText && <span className={styles.cardBadge}>{badgeText}</span>}

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
          onClick={handleAddToCart}
        >
          {isAdded ? (
            <>
              <Check size={15} color="#ffffff" strokeWidth={2.5} />
              <span>Go to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} color="#ffffff" strokeWidth={2.2} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
