'use client';

import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Star, ShoppingCart, Trash2, Check, SlidersHorizontal } from 'lucide-react';
import { VariantSelectorModal } from '@/components/shop/VariantSelectorModal/VariantSelectorModal';
import { BackendProductVariant } from '@/types/product';
import styles from './HomeProductCard.module.css';

export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewsCount?: number;
  image: string;
  mainCategory?: string;
  subCategory?: string;
  brand?: string;
  badge?: string;
  description?: string;
  variantId?: string;
  selectedVariantId?: string;
  variantName?: string;
  isWishlisted?: boolean;
  stock?: number;
  type?: 'SIMPLE' | 'VARIABLE';
  slug?: string;
  variants?: BackendProductVariant[];
}

interface HomeProductCardProps {
  product: HomeProduct;
  onRemoveFromWishlist?: (id: string) => void;
}

function HomeProductCardComponent({ product, onRemoveFromWishlist }: HomeProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const { addToCart } = useCart();

  const productId = product?.id || '';
  const targetVariantId = product.variantId || product.selectedVariantId;
  const productHref = targetVariantId
    ? `/product/${productId}?variant=${targetVariantId}`
    : `/product/${productId}`;
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount ?? 0;
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const isVariable = product.type === 'VARIABLE';
  const hasExplicitVariant = Boolean(targetVariantId);

  const isWishlisted = checkIsWishlisted(productId, targetVariantId) || Boolean(product.isWishlisted);

  const discountPercent = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    if (product.badge === 'Sale') return 15;
    return null;
  }, [product.originalPrice, product.price, product.badge]);

  const brandLabel = (product.brand || 'KICKAT').toUpperCase();

  const handleWishlistClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(productId);
      return;
    }

    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    await toggleWishlist(product, targetVariantId);
  }, [onRemoveFromWishlist, productId, product, targetVariantId, isAuthenticated, router, toggleWishlist]);

  const isAddingRef = useRef(false);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (isAdded) {
      router.push('/cart');
      return;
    }

    if (isVariable && !hasExplicitVariant) {
      setIsVariantModalOpen(true);
      return;
    }

    if (isAddingRef.current || isAdding) return;
    isAddingRef.current = true;
    setIsAdding(true);
    try {
      await addToCart(productId, targetVariantId, 1);
      setIsAdded(true);

      setTimeout(() => {
        setIsAdded(false);
      }, 2500);

      const startElem = e.currentTarget as HTMLElement;
      const bottomNavCart = document.getElementById('bottom-nav-cart-btn');
      const topNavbarCart = document.getElementById('navbar-cart-btn');
      const cartBtn = (bottomNavCart && window.getComputedStyle(bottomNavCart).display !== 'none' && bottomNavCart.offsetWidth > 0)
        ? bottomNavCart
        : topNavbarCart;
      const flyingImageSrc = product.image || '/hero-products/dog_food.png';

      if (cartBtn) {
        const startRect = startElem.getBoundingClientRect();
        const endRect = cartBtn.getBoundingClientRect();

        const flyingImg = document.createElement('img');
        flyingImg.src = flyingImageSrc;
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
          boxShadow: '0 10px 25px rgba(242, 140, 15, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
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
      isAddingRef.current = false;
    }
  }, [isAdded, isAdding, isOutOfStock, isVariable, hasExplicitVariant, productId, targetVariantId, product.image, router, addToCart]);

  const handleBuyNow = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (isVariable && !hasExplicitVariant) {
      setIsVariantModalOpen(true);
      return;
    }

    if (isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      await addToCart(productId, targetVariantId, 1);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-item-added'));
      }
      router.push('/checkout/place-order');
    } catch (err) {
      console.warn("Buy now error:", err);
      router.push('/checkout/place-order');
    } finally {
      setIsBuyingNow(false);
    }
  }, [isOutOfStock, isVariable, hasExplicitVariant, isBuyingNow, addToCart, productId, targetVariantId, router]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest(`.${styles.cardWishlistBtn}`) ||
      target.closest(`.${styles.buyNowBtn}`) ||
      target.closest(`.${styles.cartIconBtn}`) ||
      target.closest(`.${styles.addToCartBtn}`)
    ) {
      return;
    }
    if (productId) {
      window.open(productHref, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={styles.homeCard} onClick={handleCardClick}>
      {/* Variant Selector Modal */}
      {isVariable && !hasExplicitVariant && (
        <VariantSelectorModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          product={product}
          onAddToCartSuccess={() => setIsAdded(true)}
        />
      )}

      {/* Product Image Area */}
      <div className={styles.cardImageArea}>
        {product.badge && (
          <span className={styles.cardBadge}>
            {product.badge === 'New' || product.badge === 'New Arrival'
              ? 'NEW'
              : product.badge === 'Sale'
              ? 'SALE'
              : product.badge === 'Best Seller' || product.badge === 'Bestseller'
              ? 'BEST SELLER'
              : product.badge.toUpperCase()}
          </span>
        )}

        {/* Wishlist Button */}
        {onRemoveFromWishlist ? (
          <button 
            type="button"
            className={styles.cardWishlistBtn} 
            aria-label="Remove from wishlist"
            onClick={handleWishlistClick}
          >
            <Trash2 size={15} strokeWidth={2} color="#C34A42" />
          </button>
        ) : (
          <button 
            type="button"
            className={`${styles.cardWishlistBtn} ${isWishlisted ? styles.wishlistedActive : ''}`} 
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleWishlistClick}
          >
            <Heart
              size={15}
              className={isWishlisted ? styles.heartFilled : ''}
              color={isWishlisted ? '#F28C0F' : '#4A4238'}
              strokeWidth={2}
            />
          </button>
        )}

        <Link href={productHref} target="_blank" rel="noopener noreferrer" prefetch={true} className={styles.cardImageLink}>
          <SafeImage
            src={product.image}
            productName={product.name}
            categoryName={product.mainCategory}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className={styles.cardImage}
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>

      {/* Card Details Area */}
      <div className={styles.cardContent}>
        {/* Brand label */}
        <div className={styles.brandRow}>
          <span className={styles.brandText}>{brandLabel}</span>
        </div>

        {/* Product Title */}
        <Link href={productHref} target="_blank" rel="noopener noreferrer" prefetch={true} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle} title={product.name}>{product.name}</h3>
        </Link>

        {/* Rating Row */}
        {reviewsCount > 0 && rating > 0 && (
          <div className={styles.cardRatingRow}>
            <div className={styles.starsGroup}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={12} 
                  fill={star <= Math.floor(rating) ? "#F28C0F" : star - rating < 1 ? "#F28C0F" : "#E5E7EB"} 
                  color={star <= Math.floor(rating) ? "#F28C0F" : star - rating < 1 ? "#F28C0F" : "#E5E7EB"} 
                  strokeWidth={0} 
                />
              ))}
            </div>
            <span className={styles.cardRatingScore}>{rating.toFixed(1)}</span>
            <span className={styles.cardReviewsCount}>({reviewsCount})</span>
          </div>
        )}

        {/* Price Row */}
        <div className={styles.priceContainer}>
          <div className={styles.priceRowUpper}>
            <span className={styles.cardPrice}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          {discountPercent && (
            <span className={styles.discountTag}>{discountPercent}% OFF</span>
          )}
        </div>

        {/* Dual Actions CTA Row (Single-line on mobile & desktop: Buy Now + Cart Icon) */}
        <div className={styles.cardActionsRow}>
          {isOutOfStock ? (
            <button 
              type="button"
              disabled 
              className={styles.outOfStockBtn}
              aria-label="Out of stock"
            >
              <span>Out of Stock</span>
            </button>
          ) : isVariable && !hasExplicitVariant ? (
            <button 
              type="button"
              className={styles.buyNowBtn}
              onClick={() => setIsVariantModalOpen(true)}
              aria-label="Select product options"
            >
              <SlidersHorizontal size={14} strokeWidth={2.2} />
              <span>Select Options</span>
            </button>
          ) : (
            <>
              {/* Primary "Buy Now" CTA */}
              <button
                type="button"
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                aria-label={`Buy ${product.name} now`}
              >
                <span>{isBuyingNow ? 'Processing…' : 'Buy Now'}</span>
              </button>

              {/* Cart Icon Companion Button */}
              <button
                type="button"
                className={`${styles.cartIconBtn} ${isAdded ? styles.cartIconAdded : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding}
                aria-label={isAdded ? 'Added to cart' : `Add ${product.name} to cart`}
                title={isAdded ? 'Item added to cart' : 'Add to cart'}
              >
                {isAdded ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <ShoppingCart size={16} strokeWidth={2.2} />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const HomeProductCard = memo(HomeProductCardComponent);
export default HomeProductCard;
