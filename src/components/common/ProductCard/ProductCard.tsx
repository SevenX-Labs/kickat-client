'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Star, ShoppingCart, Trash2, Check, Truck, SlidersHorizontal } from 'lucide-react';
import { VariantSelectorModal } from '@/components/shop/VariantSelectorModal/VariantSelectorModal';
import { BackendProductVariant } from '@/types/product';
import styles from './ProductCard.module.css';

export interface Product {
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
  tags?: string[];
  description?: string;
  color?: string;
  colors?: string[];
  variantId?: string;
  selectedVariantId?: string;
  variantName?: string;
  isWishlisted?: boolean;
  stock?: number;
  type?: 'SIMPLE' | 'VARIABLE';
  slug?: string;
  variants?: BackendProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onRemoveFromWishlist?: (id: string, variantId?: string) => void;
}

function ProductCardComponent({ product, onRemoveFromWishlist }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const [selectedSwatch, setSelectedSwatch] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const initialVariantId = product.variantId || product.selectedVariantId || (product.variants && product.variants.length > 0 ? product.variants[0].id : undefined);
  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(initialVariantId);

  useEffect(() => {
    if (product.variantId || product.selectedVariantId) {
      setActiveVariantId(product.variantId || product.selectedVariantId);
    }
  }, [product.variantId, product.selectedVariantId]);

  const isSpecificVariantCard = Boolean(product.variantId || product.selectedVariantId);
  const targetVariantId = product.variantId || product.selectedVariantId || activeVariantId;

  const activeVariant = useMemo(() => {
    if (isSpecificVariantCard || !product.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => v.id === activeVariantId) || null;
  }, [isSpecificVariantCard, product.variants, activeVariantId]);

  const isWishlisted = checkIsWishlisted(product.id, targetVariantId);

  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount ?? 0;

  const currentPrice = (!isSpecificVariantCard && activeVariant)
    ? (activeVariant.discountPrice && activeVariant.discountPrice > 0 ? activeVariant.discountPrice : activeVariant.price)
    : product.price;

  const currentOriginalPrice = (!isSpecificVariantCard && activeVariant)
    ? (activeVariant.originalPrice || (activeVariant.discountPrice && activeVariant.discountPrice > 0 ? activeVariant.price : undefined))
    : product.originalPrice;

  const currentStock = (!isSpecificVariantCard && activeVariant)
    ? activeVariant.stock
    : (product.stock ?? 1);

  const isOutOfStock = currentStock <= 0;

  const activeImage = (!isSpecificVariantCard && activeVariant?.imageUrl)
    || (!isSpecificVariantCard && activeVariant?.images && activeVariant.images[0])
    || product.image 
    || '/hero-products/dog_food.png';

  const isVariable = product.type === 'VARIABLE' || (Array.isArray(product.variants) && product.variants.length > 0);

  // Only show color swatches if genuine color options exist on the product
  const availableColors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : product.color
    ? [product.color]
    : [];

  const discountPercent = useMemo(() => {
    return currentOriginalPrice && currentOriginalPrice > currentPrice 
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : product.badge === 'Sale' ? 15 : null;
  }, [currentOriginalPrice, currentPrice, product.badge]);

  const handleSelectVariant = (variant: BackendProductVariant) => {
    if (variant.stock <= 0) return;
    setActiveVariantId(variant.id);
    setIsAdded(false);
  };

  const handleWishlistClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id, targetVariantId);
      return;
    }

    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    await toggleWishlist(product, targetVariantId);
  }, [onRemoveFromWishlist, product, targetVariantId, isAuthenticated, router, toggleWishlist]);

    const { addToCart } = useCart();
  const isAddingRef = useRef(false);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (isAdded) {
      router.push('/cart');
      return;
    }

    if (isAddingRef.current || isAdding) return;
    isAddingRef.current = true;
    setIsAdding(true);

    // Determine target variant ID
    const effectiveVariantId = activeVariantId || product.variantId || product.selectedVariantId || (product.variants && product.variants[0]?.id);

    try {
      await addToCart(product.id, effectiveVariantId, 1);
      setIsAdded(true);

      const startElem = e.currentTarget as HTMLElement;
      const bottomNavCart = document.getElementById('bottom-nav-cart-btn');
      const topNavbarCart = document.getElementById('navbar-cart-btn');
      const cartBtn = (bottomNavCart && window.getComputedStyle(bottomNavCart).display !== 'none' && bottomNavCart.offsetWidth > 0)
        ? bottomNavCart
        : topNavbarCart;

      if (cartBtn) {
        const startRect = startElem.getBoundingClientRect();
        const endRect = cartBtn.getBoundingClientRect();

        const flyingImg = document.createElement('img');
        flyingImg.src = activeImage;
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
      isAddingRef.current = false;
    }
  }, [isAdded, isAdding, isOutOfStock, isVariable, activeVariantId, product.id, product.variantId, product.selectedVariantId, activeImage, router, addToCart]);

  const productHref = targetVariantId
    ? `/product/${product.id}?variant=${targetVariantId}`
    : `/product/${product.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest(`.${styles.cardWishlistBtn}`) ||
      target.closest(`.${styles.cardRemoveBtn}`) ||
      target.closest(`.${styles.addToCartBtn}`) ||
      target.closest(`.${styles.desktopWishlistBtn}`) ||
      target.closest(`.${styles.variantChip}`) ||
      target.closest(`.${styles.swatchDot}`)
    ) {
      return;
    }
    window.open(productHref, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      {/* Variant Selector Modal for Variable Products */}
      {isVariable && !isSpecificVariantCard && (
        <VariantSelectorModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          product={product}
          onAddToCartSuccess={() => setIsAdded(true)}
        />
      )}

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

        {/* Wishlist Button */}
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
            
          >
            <Heart
              size={15}
              className={isWishlisted ? styles.heartFilled : ''}
              strokeWidth={2}
            />
          </button>
        )}

        <Link href={productHref} target="_blank" rel="noopener noreferrer" prefetch={true} className={styles.cardImageLink}>
          <SafeImage
            src={activeImage}
            productName={product.name}
            categoryName={product.mainCategory}
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
        <Link href={productHref} target="_blank" rel="noopener noreferrer" prefetch={true} className={styles.cardTitleLink}>
          <h3 className={styles.cardTitle}>{product.name}</h3>
        </Link>
        
        {/* Rating Row (only shown when there are genuine verified reviews) */}
        {reviewsCount > 0 && rating > 0 && (
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
        )}

        {/* Price Row */}
        <div className={styles.priceContainer}>
          <div className={styles.priceRowUpper}>
            <span className={styles.cardPrice}>₹{currentPrice.toLocaleString()}</span>
            {currentOriginalPrice && (
              <span className={styles.originalPrice}>₹{currentOriginalPrice.toLocaleString()}</span>
            )}
          </div>
          {discountPercent && (
            <span className={styles.discountTag}>{discountPercent}% OFF</span>
          )}
        </div>

        {/* Variety Switcher Chips (Only rendered when card is NOT an individual variant card) */}
        {!isSpecificVariantCard && product.variants && product.variants.length > 1 && (
          <div className={styles.variantChipsRow}>
            {product.variants.map((v) => {
              const isSelected = activeVariantId === v.id;
              const isVarOutOfStock = v.stock <= 0;
              let label = v.name;
              if (v.attributes && typeof v.attributes === 'object') {
                const vals = Object.values(v.attributes).filter(Boolean);
                if (vals.length > 0) label = String(vals[0]);
              }
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isVarOutOfStock}
                  className={`${styles.variantChip} ${isSelected ? styles.variantChipActive : ''} ${isVarOutOfStock ? styles.variantChipDisabled : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectVariant(v);
                  }}
                  title={isVarOutOfStock ? `${label} (Out of stock)` : `${label} - ₹${v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price}`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Real Variant Color Swatches (only rendered if product actually has color variants) */}
        {availableColors.length > 0 && (
          <div className={styles.colorSwatches}>
            {availableColors.map((color, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSwatch(idx);
                }}
                className={`${styles.swatchDot} ${selectedSwatch === idx ? styles.swatchActive : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color option ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Vertical Divider */}
      <div className={styles.desktopDivider} />

      {/* Action Column */}
      <div className={styles.cardActionCol}>
        <div className={styles.rightActionsRow}>
          <button 
            className={styles.addToCartBtn}
            disabled={isAdding || isOutOfStock}
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? (
              <span className={styles.btnText}>Out of Stock</span>
            ) : isAdded ? (
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
              
            >
              <Heart
                size={18}
                className={isWishlisted ? styles.heartFilled : ''}
                strokeWidth={2}
              />
            </button>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className={styles.stockDeliveryGroup}>
          <div className={styles.inStockBadge}>
            <span className={isOutOfStock ? styles.redPulseDot : styles.greenPulseDot} />
            <Truck size={13} className={styles.truckIcon} />
            <span>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
