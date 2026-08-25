"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Cart.module.css';
import { RelatedProducts } from '@/components/shop/ProductDetail/RelatedProducts';
import { TrustStrip } from '@/components/common/TrustStrip/TrustStrip';

// Mock Cart Data
const initialCart = [
  {
    id: '1',
    name: 'Precision Digital Thermostat Submersible Heater 200W',
    variant: '200W',
    price: 1499,
    quantity: 1,
    image: '/hero-products/pet_bowl.png'
  },
  {
    id: '2',
    name: 'Premium Leather Dog Collar',
    variant: 'Brown / Large',
    price: 899,
    quantity: 2,
    image: '/hero-products/dog_food.png'
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCart);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST mock
  
  // Free shipping threshold
  const freeShippingThreshold = 2000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>Your cart is empty.</p>
          <Link href="/shop" className={styles.checkoutBtn} style={{ maxWidth: '250px', margin: '0 auto' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.cartLayout}>
          {/* Left Column: Items */}
          <div className={styles.itemsColumn}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImageWrapper}>
                  <Image src={item.image} alt={item.name} fill className={styles.itemImage} />
                </div>
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <Link href={`/product/${item.id}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <span className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  
                  <span className={styles.itemVariant}>{item.variant}</span>
                  
                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.summaryColumn}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.shippingTracker}>
              {isFreeShipping ? (
                <p className={styles.trackerText}>
                  You&apos;ve unlocked <span className={styles.trackerHighlight}>Free Shipping</span>
                </p>
              ) : (
                <p className={styles.trackerText}>
                  Add <span className={styles.trackerHighlight}>₹{amountToFreeShipping.toLocaleString()}</span> more for Free Shipping
                </p>
              )}
              <div className={styles.trackerBar}>
                <div className={styles.trackerFill} style={{ width: `${shippingProgress}%` }}></div>
              </div>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Tax (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{isFreeShipping ? 'FREE' : '₹150'}</span>
            </div>
            
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>₹{(subtotal + tax + (isFreeShipping ? 0 : 150)).toLocaleString()}</span>
            </div>
            
            <Link href="/checkout" className={styles.checkoutBtn}>
              Proceed to Checkout
            </Link>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.85rem' }}>
              Secure Encrypted Checkout
            </div>
          </div>
        </div>
      )}
      
      {/* You May Also Like / Trust Strip */}
      <div style={{ marginTop: '6rem' }}>
        <RelatedProducts />
      </div>
      <TrustStrip />
    </main>
  );
}
