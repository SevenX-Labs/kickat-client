'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Heart, Star, ShoppingCart, Trash2, Truck, Check } from 'lucide-react';
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
  variantId?: string;
  selectedVariantId?: string;
  isWishlisted?: boolean;
}

interface ProductCardProps {
  product: Product;
  onRemoveFromWishlist?: (id: string) => void;
}

const defaultSwatches = ['#F99205', '#F0E6D8', '#6B7280', '#2D2D2D'];

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

function ProductCardComponent({ product, onRemoveFromWishlist }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedSwatch, setSelectedSwatch] = useState(0);
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
      : product.badge === 'Sale' ? 15 : null;
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
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
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
    <div className={styles.productCard}>
      {/* Product Image Area */}
      <div className={styles.cardImageArea}>
        {product.badge && product.badge !== 'Best Seller' && product.badge !== 'Popular' && (
          <span className={styles.cardBadge}>
            {product.badge === 'New' || product.badge === 'New Arrival'
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
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlistClick}
            disabled={isWishlistLoading}
          >
            <Heart
              size={15}
              className={isWishlisted ? styles.heartFilled : ''}
              strokeWidth={2}
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

      {/* Middle Details Column */}
      <div className={styles.cardInfo}>
        <Link href={`/product/${product.id}`} prefetch={true} target="_blank" rel="noopener noreferrer" className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>
        
        {/* Rating Row */}
        <div className={styles.cardRatingRow}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={13} 
                fill={star <= Math.floor(rating) ? "#F99205" : star - rating < 1 ? "#F99205" : "#E5E7EB"} 
                color={star <= Math.floor(rating) ? "#F99205" : star - rating < 1 ? "#F99205" : "#E5E7EB"} 
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
            disabled={isAdding}
            aria-label="Add to cart"
            onClick={handleAddToCart}
          >
            {isAdded ? (
              <>
                <Check size={15} color="#ffffff" strokeWidth={2.5} />
                <span className={styles.btnText}>Go to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} color="#ffffff" strokeWidth={2.2} />
                <span className={styles.btnText}>Add to Cart</span>
              </>
            )}
          </button>

          {/* Wishlist / Remove Button in Action Row */}
          {onRemoveFromWishlist ? (
            <button 
              className={`${styles.desktopWishlistBtn} ${styles.removeWishlistActive}`} 
              aria-label="Remove from wishlist"
              onClick={handleWishlistClick}
              title="Remove item from wishlist"
            >
              <Trash2
                size={16}
                strokeWidth={2}
                color="#DC2626"
              />
            </button>
          ) : (
            <button 
              className={`${styles.desktopWishlistBtn} ${isWishlisted ? styles.wishlistedActive : ''}`} 
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={handleWishlistClick}
              disabled={isWishlistLoading}
            >
              <Heart
                size={18}
                className={isWishlisted ? styles.heartFilled : ''}
                strokeWidth={2}
              />
            </button>
          )}
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

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
