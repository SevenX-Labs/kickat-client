'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
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

function HomeProductCardComponent({ product, onRemoveFromWishlist }: HomeProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;

  const discountPercent = useMemo(() => {
    return product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.badge === 'Sale' ? 25 : 20;
  }, [product.originalPrice, product.price, product.badge]);

  const handleWishlistClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
    } else {
      setIsWishlisted((prev) => !prev);
    }
  }, [onRemoveFromWishlist, product.id]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      router.push('/cart');
      return;
    }

    const startElem = e.currentTarget as HTMLElement;
    const bottomNavCart = document.getElementById('bottom-nav-cart-btn');
    const topNavbarCart = document.getElementById('navbar-cart-btn');
    const cartBtn = (bottomNavCart && window.getComputedStyle(bottomNavCart).display !== 'none' && bottomNavCart.offsetWidth > 0)
      ? bottomNavCart
      : topNavbarCart;
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
  }, [isAdded, product.image, router]);

  return (
    <div className={styles.card}>
      {/* Product Image Area */}
      <div className={styles.cardImageArea}>
        {product.badge && (
          <span className={styles.cardBadge}>
            {product.badge === 'New' || product.badge === 'New Arrival'
              ? 'NEW'
              : product.badge === 'Sale'
              ? 'SALE'
              : product.badge.toUpperCase()}
          </span>
        )}

        {/* Wishlist Button */}
        {onRemoveFromWishlist ? (
          <button 
            className={styles.cardWishlistBtn} 
            aria-label="Remove from wishlist"
            onClick={handleWishlistClick}
          >
            <Trash2 size={16} strokeWidth={2} color="#C34A42" />
          </button>
        ) : (
          <button 
            className={`${styles.cardWishlistBtn} ${isWishlisted ? styles.wishlistedActive : ''}`} 
            aria-label="Add to wishlist"
            onClick={handleWishlistClick}
          >
            <Heart
              size={16}
              className={isWishlisted ? styles.heartFilled : ''}
              color={isWishlisted ? '#FD802E' : '#111827'}
              strokeWidth={1.8}
            />
          </button>
        )}

        <Link href={`/product/${product.id}`} prefetch={true} className={styles.cardImageLink}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.cardImage}
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* Details Area */}
      <div className={styles.cardContent}>
        <div className={styles.categoryRow}>
          <span className={styles.categoryText}>{product.brand || product.mainCategory || 'KickAt Essential'}</span>
        </div>

        <Link href={`/product/${product.id}`} prefetch={true} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>

        {/* Rating Row */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                fill={star <= Math.floor(rating) ? "#FD802E" : "#E5E7EB"} 
                color={star <= Math.floor(rating) ? "#FD802E" : "#E5E7EB"} 
                strokeWidth={0} 
              />
            ))}
          </div>
          <span className={styles.ratingScore}>{rating.toFixed(1)}</span>
          <span className={styles.reviewsCount}>({reviewsCount})</span>
        </div>

        {/* Price Row */}
        <div className={styles.priceRow}>
          <div className={styles.priceGroup}>
            <span className={styles.currentPrice}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          {discountPercent && (
            <span className={styles.discountBadge}>{discountPercent}% OFF</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          className={`${styles.addToCartBtn} ${isAdded ? styles.addedBtn : ''}`}
          onClick={handleAddToCart}
          aria-label="Add to cart"
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

export const HomeProductCard = memo(HomeProductCardComponent);
export default HomeProductCard;
