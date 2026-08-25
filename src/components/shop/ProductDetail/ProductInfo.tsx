"use client";

import { useState } from 'react';
import { Star, Heart, ShoppingBag, Truck, RefreshCcw, ShieldCheck, Ruler, Share2 } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [isAdding, setIsAdding] = useState(false);

  // Fallback values for layout since mock data might be missing some
  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = product.colors || [
    { name: 'Charcoal Gray', hex: '#444' },
    { name: 'Light Gray', hex: '#ccc' },
    { name: 'Beige', hex: '#e8ddcb' },
    { name: 'Black', hex: '#111' },
  ];
  const reviewsCount = product.reviewsCount || 128;
  const rating = product.rating || 4.8;
  const description = product.description || "Premium quality product designed specifically for your pet's comfort, safety, and ultimate well-being. Crafted with durable materials and thoughtful design.";

  // Derived Values
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className={styles.infoWrapper}>
      {product.badge && (
        <span className={styles.badge}>{product.badge}</span>
      )}
      
      <h1 className={styles.title}>{product.name}</h1>

      <div className={styles.ratingWrapper}>
        <div className={styles.ratingStars}>
          <Star size={16} fill="none" color="#E7A03B" strokeWidth={2.5} />
          <span className={styles.ratingNumber}>{rating}</span>
        </div>
        <a href="#reviews" className={styles.reviewsAnchor}>({reviewsCount} reviews)</a>
      </div>

      <div className={styles.priceWrapper}>
        <span className={styles.price}>₹{product.price.toLocaleString()}</span>
        {product.originalPrice && (
          <>
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
            <span className={styles.discountBadge}>{discountPercent}% OFF</span>
          </>
        )}
      </div>

      <p className={styles.description}>{description}</p>

      {/* Color Selector */}
      <div className={styles.selectorGroup}>
        <div className={styles.selectorHeader}>
          <span className={styles.selectorLabel}>
            Color: <span className={styles.selectorValue}>{selectedColor}</span>
          </span>
        </div>
        <div className={styles.colorOptions}>
          {colors.map(color => (
            <button
              key={color.name}
              className={`${styles.colorBtn} ${selectedColor === color.name ? styles.active : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setSelectedColor(color.name)}
              aria-label={`Select ${color.name}`}
            />
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div className={styles.selectorGroup}>
        <div className={styles.selectorHeader}>
          <span className={styles.selectorLabel}>
            Size: <span className={styles.selectorValue}>{selectedSize}</span>
          </span>
          <button className={styles.sizeGuideLink}>
            <Ruler size={16} /> Size Guide
          </button>
        </div>
        <div className={styles.sizeOptions}>
          {sizes.map(size => (
            <button
              key={size}
              className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actionsWrapper}>
        <button 
          className={`${styles.addToCartBtn} ${isAdding ? styles.addedToCart : ''}`} 
          onClick={() => {
            if (isAdding) return;
            setIsAdding(true);
            setTimeout(() => setIsAdding(false), 2000);
          }}
        >
          {isAdding ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              Added to Cart <span style={{ fontSize: '1.2rem' }}>✓</span>
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button className={styles.wishlistBtn} aria-label="Add to wishlist">
          <Heart size={24} color="#111" />
        </button>
        <button 
          className={styles.shareBtn} 
          aria-label="Share product"
          onClick={() => {
             if (navigator.share) {
               navigator.share({
                 title: product.name,
                 url: window.location.href,
               }).catch(console.error);
             } else {
               navigator.clipboard.writeText(window.location.href);
               alert('Link copied to clipboard!');
             }
          }}
        >
          <Share2 size={24} color="#111" />
        </button>
      </div>

      {/* Mini Features */}
      <div className={styles.miniFeatures}>
        <div className={styles.featureItem}>
          <Truck className={styles.featureIcon} size={20} />
          <div className={styles.featureText}>
            <span className={styles.featureTitle}>Free Shipping</span>
            <span className={styles.featureSub}>On orders over ₹999</span>
          </div>
        </div>
        <div className={styles.featureItem}>
          <RefreshCcw className={styles.featureIcon} size={20} />
          <div className={styles.featureText}>
            <span className={styles.featureTitle}>Easy Returns</span>
            <span className={styles.featureSub}>30-day return policy</span>
          </div>
        </div>
        <div className={styles.featureItem}>
          <ShieldCheck className={styles.featureIcon} size={20} />
          <div className={styles.featureText}>
            <span className={styles.featureTitle}>Secure Payment</span>
            <span className={styles.featureSub}>100% secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
