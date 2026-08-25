"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, CreditCard, Banknote } from 'lucide-react';
import styles from './Checkout.module.css';

// Mock Cart Data for Checkout
const checkoutItems = [
  {
    id: '1',
    name: 'Precision Digital Thermostat Submersible Heater 200W',
    price: 1499,
    quantity: 1,
    image: '/hero-products/fish_aquarium.png'
  },
  {
    id: '2',
    name: 'Premium Leather Dog Collar',
    price: 899,
    quantity: 2,
    image: '/hero-products/dog_food.png'
  }
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST mock
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Order placed successfully! This is a mock checkout.');
  };

  return (
    <main className={styles.container}>
      <div className={styles.checkoutHeader}>
        <h1 className={styles.title}>Secure Checkout</h1>
        <p className={styles.subtitle}>Complete your order safely and securely</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
        {/* Left Column: Forms */}
        <div className={styles.formsColumn}>
          
          {/* Step 1: Contact Info */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.stepNumber}>1</span> Contact Information
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" required className={styles.input} placeholder="Enter your email" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone Number</label>
                <input type="tel" required className={styles.input} placeholder="Mobile number" />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.stepNumber}>2</span> Shipping Address
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>First Name</label>
                <input type="text" required className={styles.input} placeholder="First name" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Last Name</label>
                <input type="text" required className={styles.input} placeholder="Last name" />
              </div>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Address</label>
                <input type="text" required className={styles.input} placeholder="Street address or P.O. Box" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>City</label>
                <input type="text" required className={styles.input} placeholder="City" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Postal Code</label>
                <input type="text" required className={styles.input} placeholder="PIN code" />
              </div>
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.stepNumber}>3</span> Payment Method
            </h2>
            <div className={styles.paymentMethods}>
              <label className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.selected : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="card" 
                  checked={paymentMethod === 'card'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={styles.paymentRadio} 
                />
                <span className={styles.paymentLabel}><CreditCard size={20} color="#111" /> Credit / Debit Card</span>
              </label>
              
              <label className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="upi" 
                  checked={paymentMethod === 'upi'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={styles.paymentRadio} 
                />
                <span className={styles.paymentLabel}><Banknote size={20} color="#111" /> UPI / Net Banking</span>
              </label>
            </div>
          </div>
          
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryColumn}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryItems}>
            {checkoutItems.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <div className={styles.itemThumb}>
                  <Image src={item.image} alt={item.name} fill className={styles.itemThumbImg} />
                  <div className={styles.itemBadge}>{item.quantity}</div>
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>₹{item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Estimated Tax</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          
          <button type="submit" className={styles.placeOrderBtn}>
            <Lock size={18} /> Place Order - ₹{total.toLocaleString()}
          </button>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#4CAF50" /> 100% Secure & Encrypted Payment
          </div>
        </div>
      </form>
    </main>
  );
}
