"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingBag, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './Cart.module.css';
import { RelatedProducts } from '@/components/shop/ProductDetail/RelatedProducts';
import { TrustStrip } from '@/components/common/TrustStrip/TrustStrip';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

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
    document.title = `Your Shopping Cart (${cartCount}) | KickAt`;
  }, [cartCount]);

  const subtotal = summary?.subtotal ?? items.reduce((acc, item) => acc + item.totalPrice, 0);
  const productDiscount = summary?.productDiscount ?? 0;
  
  // Free delivery logic
  const freeShippingThreshold = summary?.freeDeliveryThreshold ?? 2000;
  const isFreeShipping = summary?.isFreeDelivery ?? (subtotal >= freeShippingThreshold);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Delivery fee calculation
  const deliveryFee = isFreeShipping ? 0 : (summary?.deliveryFee ?? 150);
  const taxAmount = summary?.taxAmount ?? summary?.tax ?? Math.round(subtotal * 0.18);
  const platformFee = summary?.platformFee ?? 0;
  const grandTotal = summary?.totalAmount ?? summary?.total ?? (subtotal + taxAmount + deliveryFee + platformFee);

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
        /* Empty Cart State */
        <div className={styles.emptyState}>
          <ShoppingBag size={48} strokeWidth={1.4} />
          <h2>Your cart is empty.</h2>
          <p>Browse our latest pet essentials and bring your favorites back here.</p>
          <button onClick={() => router.push('/categories')} className={styles.checkoutBtn}>
            Explore Products
          </button>
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
                    <Image
                      src={imageSrc}
                      alt={item.product?.name || 'Product Image'}
                      fill
                      className={styles.itemImage}
                    />
                  </div>

                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <button
                        onClick={() => router.push(`/product/${item.productId}`)}
                        className={styles.itemName}
                      >
                        {item.product?.name || 'Pet Product'}
                      </button>
                      <span className={styles.itemPrice}>₹{itemTotal.toLocaleString()}</span>
                    </div>

                    <div className={styles.itemMeta}>
                      {variantName && <span>{variantName}</span>}
                      <span>₹{unitPrice.toLocaleString()} each</span>
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
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            {productDiscount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>Product Savings</span>
                <span>-₹{productDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Estimated Tax (18% GST)</span>
              <span>₹{taxAmount.toLocaleString()}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Delivery Fee</span>
              <span>{isFreeShipping ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>

            {platformFee > 0 && (
              <div className={styles.summaryRow}>
                <span>Platform Fee</span>
                <span>₹{platformFee.toLocaleString()}</span>
              </div>
            )}

            <div className={styles.totalRow}>
              <span>Total Amount</span>
              <span>₹{grandTotal.toLocaleString()}</span>
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
