"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Zap, Ruler, Minus, Plus, Check, X, Dog, Droplets, Waves, Sun, Loader2 } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product, ProductVariant } from './ProductDetail';

interface ProductInfoProps {
  selectedVariant?: ProductVariant | null;
  onSelectVariant?: (variant: ProductVariant) => void;
  product: Product;
}

export function ProductInfo({ product, selectedVariant, onSelectVariant }: ProductInfoProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, buyNow } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);

  // Dynamic pricing & stock based on selected variant or base product
  const effectivePrice = selectedVariant
    ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price)
    : (product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price);

  const effectiveOriginalPrice = selectedVariant
    ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.price : (product.originalPrice || undefined))
    : (product.discountPrice && product.discountPrice > 0 ? product.price : (product.originalPrice || undefined));

  const currentStock = selectedVariant && selectedVariant.stock !== undefined
    ? selectedVariant.stock
    : (product.stock ?? 100);

  const isOutOfStock = currentStock <= 0;

  const discountPercent = effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
    ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
    : null;

  const title = product.name;
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviewsCount || 0;
  const description = product.description || product.descriptionTitle || "Premium quality pet essential curated for health, safety, and everyday comfort.";

  const variants = product.variants || [];
  const hasVariants = (product.type === 'VARIABLE' || variants.length > 0) && variants.length > 0;

  const animateFlyToCart = (startElem: HTMLElement) => {
    const bottomNavCart = document.getElementById('bottom-nav-cart-btn');
    const topNavbarCart = document.getElementById('navbar-cart-btn');
    const cartBtn = (bottomNavCart && window.getComputedStyle(bottomNavCart).display !== 'none' && bottomNavCart.offsetWidth > 0)
      ? bottomNavCart
      : topNavbarCart;
    const imageSrc = (selectedVariant?.imageUrl || selectedVariant?.images?.[0]) || product.image || '/hero-products/dog_food.png';

    if (!cartBtn) {
      window.dispatchEvent(new CustomEvent('cart-item-added'));
      return;
    }

    const startRect = startElem.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    const flyingImg = document.createElement('img');
    flyingImg.src = imageSrc;
    flyingImg.alt = 'Flying Product Preview';

    const width = 64;
    const height = 64;
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
      borderRadius: '16px',
      boxShadow: '0 12px 30px rgba(249, 146, 5, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
      border: '2.5px solid #ffffff',
      zIndex: '99999',
      pointerEvents: 'none',
      backgroundColor: '#ffffff',
    });

    document.body.appendChild(flyingImg);

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const animation = flyingImg.animate(
      [
        {
          transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
          opacity: 1,
        },
        {
          offset: 0.45,
          transform: `translate3d(${deltaX * 0.45}px, ${deltaY * 0.45 - 140}px, 0) scale(0.72) rotate(-12deg)`,
          opacity: 0.95,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.12) rotate(-30deg)`,
          opacity: 0.1,
        },
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
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasAdded) {
      router.push("/cart");
      return;
    }
    if (isAdding || isBuyingNow || isOutOfStock) return;
    const buttonElem = e.currentTarget;
    setIsAdding(true);
    try {
      await addToCart(product.id, selectedVariant?.id, quantity);
      animateFlyToCart(buttonElem);
      setHasAdded(true);
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      alert(err?.message || "Could not add item to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isBuyingNow || isAdding || isOutOfStock) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    setIsBuyingNow(true);
    try {
      await buyNow(product.id, selectedVariant?.id, quantity);
      router.push("/checkout");
    } catch (err: any) {
      console.error("Error with Buy Now:", err);
      alert(err?.message || "Buy now session could not be created. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Product Title */}
      <h1 className={styles.productTitle}>{title}</h1>

      {/* Brand / Category Tagline */}
      <p className={styles.productSubtitle}>
        {product.brand ? `${product.brand} · ` : ''}{product.mainCategory || 'KickAt Essential'}
      </p>

      {/* Rating & Social Proof Row */}
      <div className={styles.ratingRow}>
        {reviewsCount > 0 && rating > 0 ? (
          <>
            <div className={styles.starsGroup}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={15} 
                  fill={i < Math.floor(rating) ? "#F99205" : "#E5E7EB"} 
                  color={i < Math.floor(rating) ? "#F99205" : "#E5E7EB"} 
                  strokeWidth={0} 
                />
              ))}
              <span className={styles.ratingScore}>{rating.toFixed(1)}</span>
            </div>
            <span className={styles.ratingDivider}>|</span>
            <span className={styles.reviewsCountText}>
              {reviewsCount} {reviewsCount === 1 ? 'Review' : 'Reviews'}
            </span>
          </>
        ) : (
          <>
            <div className={styles.starsGroup}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill="#E5E7EB" 
                  color="#E5E7EB" 
                  strokeWidth={0} 
                />
              ))}
            </div>
            <a href="#reviews" className={styles.noReviewsPromptLink}>
              0 Reviews (Be the first to review)
            </a>
          </>
        )}
        {product.badge && (
          <span className={styles.verifiedBadge}>
            <Check size={12} strokeWidth={2.5} />
            <span>{product.badge}</span>
          </span>
        )}
      </div>

      {/* Price Row */}
      <div className={styles.priceContainer}>
        <div className={styles.priceRowMain}>
          <span className={styles.currentPrice}>₹{effectivePrice.toLocaleString()}</span>
          {effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice && (
            <span className={styles.originalPrice}>₹{effectiveOriginalPrice.toLocaleString()}</span>
          )}
          {discountPercent && (
            <span className={styles.discountBadge}>{discountPercent}% OFF</span>
          )}
        </div>
        <span className={styles.taxNote}>Inclusive of all taxes</span>
      </div>

      {/* Short Description */}
      <p className={styles.shortDescription}>{description}</p>

      {/* Real Variants Selector for VARIABLE Products */}
      {hasVariants && (
        <div className={styles.selectorBlock}>
          <div className={styles.selectorHeaderWithLink}>
            <div className={styles.selectorHeader}>
              <span className={styles.selectorTitle}>Options:</span>
              <span className={styles.selectorValue}>
                {selectedVariant ? selectedVariant.name : 'Select an option'}
              </span>
            </div>
            <button
              type="button"
              className={styles.sizeGuideRowLink}
              onClick={() => setIsSizeGuideModalOpen(true)}
            >
              <Ruler size={14} />
              <span>Guide</span>
            </button>
          </div>
          <div className={styles.sizePillsRow}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isVarOutOfStock = variant.stock <= 0;
              const varPrice = variant.discountPrice && variant.discountPrice > 0 ? variant.discountPrice : variant.price;

              return (
                <button
                  key={variant.id}
                  type="button"
                  className={`${styles.sizePillBtn} ${isSelected ? styles.sizePillActive : ''}`}
                  onClick={() => onSelectVariant?.(variant)}
                  style={{
                    opacity: isVarOutOfStock ? 0.5 : 1,
                    textDecoration: isVarOutOfStock ? 'line-through' : 'none',
                  }}
                  title={isVarOutOfStock ? 'Out of stock' : `₹${varPrice}`}
                >
                  <span>{variant.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Stock Row */}
      <div className={styles.quantityStockRow}>
        <div className={styles.quantityStepper}>
          <button
            type="button"
            className={styles.stepperBtn}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type="button"
            className={styles.stepperBtn}
            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className={styles.stockStatusBox}>
          {isOutOfStock ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
              <span style={{ fontWeight: 700, color: '#DC2626' }}>Out of Stock</span>
            </>
          ) : currentStock <= 5 ? (
            <>
              <span className={styles.greenDot} />
              <span className={styles.stockBold}>In Stock</span>
              <span className={styles.lowStockBadge}>Only {currentStock} left</span>
            </>
          ) : (
            <>
              <span className={styles.greenDot} />
              <span className={styles.stockBold}>In Stock</span>
            </>
          )}
        </div>
      </div>

      {/* Primary CTAs Row (Add to Cart + Buy Now) */}
      <div className={styles.primaryCtasRow}>
        <button
          type="button"
          className={`${styles.addToCartMainBtn} ${hasAdded ? styles.addedState : ''}`}
          onClick={handleAddToCart}
          disabled={isAdding || isBuyingNow || isOutOfStock}
        >
          {isAdding ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Adding...</span>
            </span>
          ) : hasAdded ? (
            <>
              <Check size={18} />
              <span>Go to Cart</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.buyNowMainBtn}
          onClick={handleBuyNow}
          disabled={isBuyingNow || isAdding || isOutOfStock}
          style={{ opacity: isOutOfStock ? 0.5 : 1 }}
        >
          {isBuyingNow ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Processing...</span>
            </span>
          ) : (
            <>
              <Zap size={18} fill="#ffffff" color="#ffffff" />
              <span>Buy Now</span>
            </>
          )}
        </button>
      </div>

      {/* Size Guide Dialogue Box Modal */}
      {isSizeGuideModalOpen && (
        <div className={styles.sizeModalBackdrop} onClick={() => setIsSizeGuideModalOpen(false)}>
          <div className={styles.sizeModalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.sizeModalCloseBtn}
              onClick={() => setIsSizeGuideModalOpen(false)}
              aria-label="Close size guide"
            >
              <X size={18} />
            </button>

            <div className={styles.sizeModalHeader}>
              <h3 className={styles.sizeModalTitle}>Size Guide &amp; Recommendations</h3>
              <p className={styles.sizeModalSubtitle}>Find the perfect fit for your pet by weight and breed.</p>
            </div>

            <div className={styles.sizeCardsRow}>
              <div className={styles.sizeCardTile}>
                <span className={styles.sizeCardLetter}>S</span>
                <span className={styles.sizeCardWeight}>Up to 5 kg</span>
                <div className={styles.sizeCardDogIconWrap}>
                  <Dog size={24} className={styles.dogIconDefault} />
                </div>
              </div>
              <div className={styles.sizeCardTile}>
                <span className={styles.sizeCardLetter}>M</span>
                <span className={styles.sizeCardWeight}>5 – 15 kg</span>
                <div className={styles.sizeCardDogIconWrap}>
                  <Dog size={24} className={styles.dogIconDefault} />
                </div>
              </div>
              <div className={styles.sizeCardTile}>
                <span className={styles.sizeCardLetter}>L</span>
                <span className={styles.sizeCardWeight}>15 – 30 kg</span>
                <div className={styles.sizeCardDogIconWrap}>
                  <Dog size={24} className={styles.dogIconDefault} />
                </div>
              </div>
            </div>

            <div className={styles.careSection}>
              <h4 className={styles.careTitle}>Care Instructions</h4>
              <div className={styles.careItemsRow}>
                <div className={styles.careItem}>
                  <Droplets size={16} className={styles.careIcon} />
                  <span>Wash with mild soap</span>
                </div>
                <div className={styles.careItem}>
                  <Waves size={16} className={styles.careIcon} />
                  <span>Rinse thoroughly</span>
                </div>
                <div className={styles.careItem}>
                  <Sun size={16} className={styles.careIcon} />
                  <span>Air dry completely</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
