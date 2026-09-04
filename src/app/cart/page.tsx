"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
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
  },
  {
    id: '3',
    name: 'Ultra Soft Pet Bed Cushion',
    variant: 'Grey / Medium',
    price: 1299,
    quantity: 1,
    image: '/hero-products/pet_bowl.png'
  },
  {
    id: '4',
    name: 'Interactive Cat Teaser Toy',
    variant: 'Multi-color',
    price: 399,
    quantity: 3,
    image: '/hero-products/dog_food.png'
  },
  {
    id: '5',
    name: 'Stainless Steel Non-Slip Pet Bowl',
    variant: 'Silver / Large',
    price: 499,
    quantity: 2,
    image: '/hero-products/pet_bowl.png'
  },
  {
    id: '6',
    name: 'Adjustable Mesh Dog Harness',
    variant: 'Blue / Small',
    price: 799,
    quantity: 1,
    image: '/hero-products/dog_food.png'
  }
];

export default function CartPage() {
  const router = useRouter();
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
  const tax = Math.round(subtotal * 0.18); // 18% GST mock
  
  // Free shipping threshold
  const freeShippingThreshold = 2000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <main className={styles.container}>
      <div className={styles.pageHeader}>
        <button onClick={() => router.push('/category')} className={styles.backBtn}>
          <ArrowLeft size={17} strokeWidth={1.8} />
          Continue Shopping
        </button>
        <div>
          <p className={styles.eyebrow}>Shopping bag</p>
          <h1 className={styles.title}>Your Cart</h1>
          <p className={styles.subtitle}>{cartItems.length} items ready for checkout</p>
        </div>
      </div>
      
      {cartItems.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={44} strokeWidth={1.4} />
          <h2>Your cart is empty.</h2>
          <p>Browse our latest essentials and bring your favorites back here.</p>
          <button onClick={() => router.push('/category')} className={styles.checkoutBtn}>
            Continue Shopping
          </button>
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
                    <button onClick={() => router.push(`/product/${item.id}`)} className={styles.itemName}>
                      {item.name}
                    </button>
                    <span className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  
                  <div className={styles.itemMeta}>
                    <span>{item.variant}</span>
                    <span>₹{item.price.toLocaleString()} each</span>
                  </div>
                  
                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">−</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} strokeWidth={1.7} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <span>{cartItems.length} items</span>
            </div>
            
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
            
            <button 
              onClick={() => {
                const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                if (!isLoggedIn) {
                  router.push('/login?redirect=/checkout');
                } else {
                  router.push('/checkout');
                }
              }} 
              className={styles.checkoutBtn}
            >
              <CreditCard size={18} strokeWidth={1.8} />
              Proceed to Checkout
            </button>
            
            <div className={styles.secureNote}>
              <ShieldCheck size={16} strokeWidth={1.8} />
              Secure Encrypted Checkout
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
