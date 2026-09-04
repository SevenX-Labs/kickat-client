"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Zap, Ruler, Minus, Plus, Check, X, Dog, Droplets, Waves, Sun } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('Charcoal & Pumpkin');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);

  const title = product.name || "Mim & Mate Natural Rubber Chew Toy";
  const badge = product.badge || "Best Seller";
  const price = product.price || 899;
  const originalPrice = product.originalPrice || 1199;
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 64;
  const description = product.description || "Premium quality natural rubber chew toy designed for your pet's comfort, safety, and long-lasting fun. Perfect for daily play and helps support dental health.";

  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const colorSwatches = [
    { name: 'Charcoal & Pumpkin', hex: '#2B2E33', hex2: '#FD802E' },
    { name: 'Pumpkin', hex: '#FD802E' },
    { name: 'Charcoal', hex: '#2B2E33' },
    { name: 'Beige', hex: '#E6DEC9' },
  ];

  const sizes = ['S', 'M', 'L'];

  const animateFlyToCart = (startElem: HTMLElement) => {
    const cartBtn = document.getElementById('navbar-cart-btn');
    const imageSrc = product.image || '/hero-products/dog_food.png';

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
      boxShadow: '0 12px 30px rgba(253, 128, 46, 0.45), 0 4px 12px rgba(0, 0, 0, 0.2)',
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

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    const buttonElem = e.currentTarget;
    setIsAdding(true);
    animateFlyToCart(buttonElem);

    setTimeout(() => {
      setIsAdding(false);
      setHasAdded(true);
    }, 1800);
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
            const bgStyle = color.hex2
              ? `linear-gradient(135deg, ${color.hex} 50%, ${color.hex2} 50%)`
              : color.hex;
            return (
              <button
                key={color.name}
                type="button"
                className={`${styles.colorSwatchBtn} ${isSelected ? styles.colorSwatchActive : ''}`}
                style={{ background: bgStyle }}
                onClick={() => setSelectedColor(color.name)}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className={styles.selectorBlock}>
        <div className={styles.selectorHeaderWithLink}>
          <div className={styles.selectorHeader}>
            <span className={styles.selectorTitle}>Size:</span>
            <span className={styles.selectorValue}>{selectedSize}</span>
          </div>
          <button
            type="button"
            className={styles.sizeGuideRowLink}
            onClick={() => setIsSizeGuideModalOpen(true)}
          >
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
          <span className={styles.lowStockBadge}>Only 5 left</span>
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
