"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CreditCard, ShieldCheck, ShoppingBag,
  Trash2, RefreshCw, AlertCircle, Sparkles, Heart,
  ArrowRight
} from 'lucide-react';
import styles from './Cart.module.css';
import { RelatedProducts } from '@/components/shop/ProductDetail/RelatedProducts';
import { TrustStrip } from '@/components/common/TrustStrip/TrustStrip';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePublicSettings } from '@/hooks/usePublicSettings';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    items,
    summary,
    cartCount,
    isLoading,
    isUpdating,
    error,
    updateQuantity,
    removeItem,
    refreshCart,
  } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    document.title = `Your Shopping Cart (${cartCount}) | KickAt`;
  }, [cartCount]);

  const subtotal = summary?.subtotal ?? items.reduce((acc, item) => acc + item.totalPrice, 0);
  const productDiscount = summary?.productDiscount ?? 0;
  
  const { delivery, tax } = usePublicSettings();
  const freeShippingThreshold = summary?.freeDeliveryThreshold ?? (delivery?.freeDeliveryThreshold ?? 0);
  const isFreeDeliveryEnabled = delivery ? delivery.deliveryFeeEnabled : true;
  const isFreeShipping = !isFreeDeliveryEnabled || freeShippingThreshold === 0 || (summary?.isFreeDelivery ?? (subtotal >= freeShippingThreshold));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = isFreeShipping ? 100 : (freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100);

  // Delivery fee calculation from server authoritative summary or live delivery settings
  const deliveryFee = isFreeShipping ? 0 : (summary?.deliveryFee ?? (delivery?.deliveryFee ?? 0));
  
  // Tax from server summary or live tax settings (Admin configurable)
  const isTaxEnabled = tax ? tax.gstEnabled : true;
  const isTaxInclusive = tax ? tax.taxInclusive : false;
  const gstPercentage = summary?.gstPercentage ?? tax?.gstPercentage ?? 0;
  const gstRate = gstPercentage / 100;
  const taxAmount = summary?.gstAmount ?? summary?.taxAmount ?? summary?.tax ?? (isTaxEnabled ? (subtotal * gstRate) : 0);
  
  // Extra / Handling fee directly from server
  const platformFee = summary?.extraFeeAmount ?? (delivery?.extraFeeEnabled ? (delivery?.extraFeeAmount ?? 0) : 0);
  const extraFeeName = summary?.extraFeeName || delivery?.extraFeeName || 'Platform Fee';
  
  const taxForTotal = isTaxInclusive ? 0 : taxAmount;
  const grandTotal = summary?.grandTotal ?? summary?.totalAmount ?? summary?.total ?? (subtotal + taxForTotal + deliveryFee + platformFee);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.pageHeader}>
        <button onClick={() => router.push('/categories')} className={styles.backBtn}>
          <ArrowLeft size={17} strokeWidth={1.8} />
          Continue Shopping
        </button>
        <div>
          <p className={styles.eyebrow}>Shopping bag</p>
          <h1 className={styles.title}>Your Cart</h1>
          <p className={styles.subtitle}>{cartCount} {cartCount === 1 ? 'item' : 'items'} ready for checkout</p>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className={styles.errorBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={refreshCart} className={styles.retryBtn}>
            <RefreshCw size={14} style={{ display: 'inline', marginRight: '4px' }} /> Retry
          </button>
        </div>
      )}

      {/* Initial Loading Skeleton */}
      {isLoading ? (
        <div className={styles.skeletonContainer}>
          <div className={styles.itemsColumn}>
            <div className={styles.skeletonItem} />
            <div className={styles.skeletonItem} />
            <div className={styles.skeletonItem} />
          </div>
          <div className={styles.skeletonSummary} />
        </div>
      ) : items.length === 0 ? (
        /* Premium Empty Cart State */
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyIllustrationArea}>
            <div className={styles.emptyGlowAura} />
            <div className={styles.emptyIconCircle}>
              <ShoppingBag size={40} strokeWidth={1.8} className={styles.emptyBagIcon} />
              <div className={styles.emptyPawFloatingBadge}>
                <span>🐾</span>
              </div>
            </div>
          </div>

          <div className={styles.emptyTextContent}>
            <div className={styles.emptyBadgePill}>
              <Sparkles size={13} color="#F28C0F" />
              <span>Your bowl is waiting</span>
            </div>
            <h2 className={styles.emptyTitle}>Your Cart is Empty</h2>
            <p className={styles.emptyDescription}>
              Looks like you haven&apos;t added any pet treats or essentials yet. Explore our veterinarian-approved nutrition, toys, and grooming gear crafted for happier pets.
            </p>
          </div>

          <div className={styles.emptyActionButtons}>
            <button
              type="button"
              onClick={() => router.push('/categories')}
              className={styles.emptyPrimaryBtn}
            >
              <Sparkles size={16} />
              <span>Explore Pet Essentials</span>
              <ArrowRight size={16} />
            </button>
            <Link href="/wishlist" className={styles.emptySecondaryBtn}>
              <Heart size={16} />
              <span>Saved Wishlist</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Cart Items & Order Summary Layout */
        <div className={styles.cartLayout}>
          {/* Left Column: Cart Items List */}
          <div className={styles.itemsColumn}>
            {items.map((item) => {
              const imageSrc = item.product?.imageUrl || '/hero-products/pet_bowl.png';
              const variantName = item.variant?.name || item.variantId;
              const unitPrice = item.unitPrice || item.product?.price || 0;
              const itemTotal = item.totalPrice || (unitPrice * item.quantity);

              return (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImageWrapper}>
                    <SafeImage
                      src={item.product?.imageUrl}
                      productName={item.product?.name}
                      categoryName={item.product?.category?.name || item.product?.category?.slug}
                      alt={item.product?.name || 'Product Image'}
                      fill
                      sizes="100px"
                      className={styles.itemImage}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>

                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <button
                        onClick={() => router.push(item.variantId ? `/product/${item.productId}?variant=${item.variantId}` : `/product/${item.productId}`)}
                        className={styles.itemName}
                      >
                        {item.product?.name || 'Pet Product'}
                      </button>
                      <span className={styles.itemPrice}>₹{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className={styles.itemMeta}>
                      {variantName && <span>{variantName}</span>}
                      <span>₹{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</span>
                    </div>

                    <div className={styles.itemActions}>
                      <div className={styles.quantityControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating}
                      >
                        <Trash2 size={16} strokeWidth={1.7} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            </div>

            {/* Free Shipping Progress Tracker */}
            <div className={styles.shippingTracker}>
              {isFreeShipping ? (
                <p className={styles.trackerText}>
                  You&apos;ve unlocked <span className={styles.trackerHighlight}>Free Shipping</span>!
                </p>
              ) : (
                <p className={styles.trackerText}>
                  Add <span className={styles.trackerHighlight}>₹{amountToFreeShipping.toLocaleString()}</span> more for Free Shipping
                </p>
              )}
              <div className={styles.trackerBar}>
                <div className={styles.trackerFill} style={{ width: `${shippingProgress}%` }} />
              </div>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {productDiscount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>Product Savings</span>
                <span>-₹{productDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {isTaxEnabled && (taxAmount > 0 || gstPercentage > 0) && (
              <div className={styles.summaryRow}>
                <span>
                  {isTaxInclusive ? 'Inclusive GST' : 'Estimated Tax'}
                  {gstPercentage > 0 ? ` (${gstPercentage}% GST)` : ''}
                </span>
                <span>
                  {isTaxInclusive
                    ? `Included (₹${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                    : `₹${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                </span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Delivery Fee</span>
              <span style={{ color: deliveryFee === 0 ? '#16A34A' : '#111827', fontWeight: deliveryFee === 0 ? 700 : 500 }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>

            {platformFee > 0 && (
              <div className={styles.summaryRow}>
                <span>{extraFeeName}</span>
                <span>₹{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className={styles.totalRow}>
              <span>Total Amount</span>
              <span>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button onClick={handleCheckout} className={styles.checkoutBtn} disabled={isUpdating}>
              <CreditCard size={18} strokeWidth={1.8} />
              Proceed to Checkout
            </button>

            <div className={styles.secureNote}>
              <ShieldCheck size={16} strokeWidth={1.8} />
              100% Encrypted &amp; Secure Checkout
            </div>
          </div>
        </div>
      )}

      {/* You May Also Like / Trust Strip */}
      <div className={styles.relatedSection}>
        <RelatedProducts />
      </div>
      <TrustStrip />
    </main>
  );
}
