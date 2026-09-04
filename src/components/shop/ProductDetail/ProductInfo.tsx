"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Zap, Heart, Share2, Gift, Ruler, Minus, Plus, Check } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('Pumpkin');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const title = product.name || "Mim & Mate Natural Rubber Chew Toy";
  const badge = product.badge || "Best Seller";
  const price = product.price || 899;
  const originalPrice = product.originalPrice || 1199;
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;
  const description = product.description || "Premium quality natural rubber chew toy designed for your pet's comfort, safety, and long-lasting fun. Perfect for daily play and helps support dental health.";

  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const colorSwatches = [
    { name: 'Pumpkin', hex: '#FD802E' },
    { name: 'Beige', hex: '#E6DEC9' },
    { name: 'Grey', hex: '#787E85' },
    { name: 'Charcoal', hex: '#2B2E33' },
  ];

  const sizes = ['S', 'M', 'L'];

  const handleAddToCart = () => {
    if (hasAdded) {
      router.push('/cart');
      return;
    }
    if (isAdding) return;
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setHasAdded(true);
    }, 1000);
  };

  const handleBuyNow = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Best Seller Badge */}
      <div className={styles.badgeRow}>
        <span className={styles.bestSellerBadge}>{badge}</span>
      </div>

      {/* Product Title */}
      <h1 className={styles.productTitle}>{title}</h1>

      {/* Tagline / Subtitle */}
      <p className={styles.productSubtitle}>Durable. Safe. Fun. Made for endless play.</p>

      {/* Rating & Social Proof Row */}
      <div className={styles.ratingRow}>
        <div className={styles.starsGroup}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={15} fill="#FD802E" color="#FD802E" strokeWidth={1} />
          ))}
          <span className={styles.ratingScore}>{rating}</span>
        </div>
        <span className={styles.ratingDivider}>|</span>
        <a href="#reviews" className={styles.reviewsLink}>({reviewsCount} reviews)</a>
        <span className={styles.ratingDivider}>|</span>
        <span className={styles.socialProofText}>2.2K+ bought</span>
      </div>

      {/* Price Row */}
      <div className={styles.priceContainer}>
        <div className={styles.priceRowMain}>
          <span className={styles.currentPrice}>₹{price.toLocaleString()}</span>
          <span className={styles.originalPrice}>₹{originalPrice.toLocaleString()}</span>
          <span className={styles.discountBadge}>{discountPercent}% OFF</span>
        </div>
        <span className={styles.taxNote}>Inclusive of all taxes</span>
      </div>

      {/* Short Description */}
      <p className={styles.shortDescription}>{description}</p>

      {/* Color Selector */}
      <div className={styles.selectorBlock}>
        <div className={styles.selectorHeader}>
          <span className={styles.selectorTitle}>Color:</span>
          <span className={styles.selectorValue}>{selectedColor}</span>
        </div>
        <div className={styles.colorSwatchesRow}>
          {colorSwatches.map((color) => {
            const isSelected = selectedColor === color.name;
            return (
              <button
                key={color.name}
                type="button"
                className={`${styles.colorSwatchBtn} ${isSelected ? styles.colorSwatchActive : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setSelectedColor(color.name)}
                aria-label={`Select ${color.name} color`}
              />
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className={styles.selectorBlock}>
        <div className={styles.selectorHeaderWithLink}>
          <div>
            <span className={styles.selectorTitle}>Size:</span>
            <span className={styles.selectorValue}>{selectedSize}</span>
          </div>
          <button type="button" className={styles.sizeGuideRowLink}>
            <Ruler size={14} />
            <span>Size Guide</span>
          </button>
        </div>
        <div className={styles.sizePillsRow}>
          {sizes.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                className={`${styles.sizePillBtn} ${isSelected ? styles.sizePillActive : ''}`}
                onClick={() => setSelectedSize(sz)}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & Stock Row */}
      <div className={styles.quantityStockRow}>
        <div className={styles.quantityStepper}>
          <button
            type="button"
            className={styles.stepperBtn}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type="button"
            className={styles.stepperBtn}
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className={styles.stockStatusBox}>
          <span className={styles.greenDot} />
          <span className={styles.stockBold}>In Stock</span>
          <span className={styles.stockSub}>Only 5 left!</span>
        </div>
      </div>

      {/* Primary CTAs Row (Add to Cart + Buy Now) */}
      <div className={styles.primaryCtasRow}>
        <button
          type="button"
          className={`${styles.addToCartMainBtn} ${hasAdded ? styles.addedState : ''}`}
          onClick={handleAddToCart}
        >
          {isAdding ? (
            <span>Adding...</span>
          ) : hasAdded ? (
            <>
              <Check size={18} />
              <span>Go to Cart</span>
            </>
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
        >
          <Zap size={18} fill="#ffffff" color="#ffffff" />
          <span>Buy Now</span>
        </button>
      </div>

      {/* Secondary Actions Row */}
      <div className={styles.secondaryActionsRow}>
        <button
          type="button"
          className={`${styles.secondaryPillBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart size={14} fill={isWishlisted ? "#FD802E" : "none"} color={isWishlisted ? "#FD802E" : "#4A453E"} />
          <span>Add to Wishlist</span>
        </button>

        <button
          type="button"
          className={styles.secondaryPillBtn}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>

        <button type="button" className={styles.secondaryPillBtn}>
          <Gift size={14} />
          <span>Gift this item</span>
        </button>
      </div>
    </div>
  );
}
