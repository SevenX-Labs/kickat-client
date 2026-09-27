'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
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
  variantId?: string;
  selectedVariantId?: string;
  isWishlisted?: boolean;
}

interface HomeProductCardProps {
  product: HomeProduct;
  onRemoveFromWishlist?: (id: string) => void;
}

function HomeProductCardComponent({ product, onRemoveFromWishlist }: HomeProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(Boolean(product.isWishlisted));
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (typeof product.isWishlisted === 'boolean') {
      setIsWishlisted(product.isWishlisted);
    }
  }, [product.isWishlisted]);

  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;

  const discountPercent = useMemo(() => {
    return product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.badge === 'Sale' ? 25 : 20;
  }, [product.originalPrice, product.price, product.badge]);

  const handleWishlistClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id);
      return;
    }

    if (isWishlistLoading) return;

    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const variantId = product.variantId || product.selectedVariantId || undefined;

    setIsWishlistLoading(true);
    if (!isWishlisted) {
      try {
        await wishlistService.addToWishlist(product.id, variantId);
        setIsWishlisted(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: product.id, action: 'add' } }));
        }
      } catch (err: any) {
        console.error('Failed to add to wishlist:', err);
      } finally {
        setIsWishlistLoading(false);
      }
    } else {
      try {
        await wishlistService.removeFromWishlist(product.id, variantId);
        setIsWishlisted(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: product.id, action: 'remove' } }));
        }
      } catch (err: any) {
        console.error('Failed to remove from wishlist:', err);
      } finally {
        setIsWishlistLoading(false);
      }
    }
  }, [onRemoveFromWishlist, product.id, product.variantId, product.selectedVariantId, isWishlisted, isWishlistLoading, isAuthenticated, router]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      router.push('/cart');
      return;
    }
    if (isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(product.id);
      setIsAdded(true);

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
          boxShadow: '0 10px 25px rgba(249, 146, 5, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
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
    } catch (err) {
      console.warn("Add to cart error:", err);
    } finally {
      setIsAdding(false);
    }
  }, [isAdded, isAdding, product.id, product.image, router, addToCart]);

  return (
    <div className={styles.homeCard}>
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
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlistClick}
            disabled={isWishlistLoading}
          >
            <Heart
              size={16}
              className={isWishlisted ? styles.heartFilled : ''}
              color={isWishlisted ? '#F99205' : '#111827'}
              strokeWidth={1.8}
            />
          </button>
        )}

        <Link href={`/product/${product.id}`} prefetch={true} target="_blank" rel="noopener noreferrer" className={styles.cardImageLink}>
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

        <Link href={`/product/${product.id}`} prefetch={true} target="_blank" rel="noopener noreferrer" className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>

        {/* Rating Row */}
        <div className={styles.cardRatingRow}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                fill={star <= Math.floor(rating) ? "#F99205" : "#E5E7EB"} 
                color={star <= Math.floor(rating) ? "#F99205" : "#E5E7EB"} 
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

        {/* Add to Cart Button */}
        <button 
          disabled={isAdding}
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
