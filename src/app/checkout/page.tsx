"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Truck, ArrowRight, Store, ArrowLeft, ChevronLeft, ChevronRight, CreditCard, Smartphone, Calendar, Clock, ChevronDown, CheckCircle2, User, MapPin, Lock, Edit3, X } from 'lucide-react';
import styles from './Checkout.module.css';

// Mock Cart Data for Checkout
const checkoutItems = [
  {
    id: '1',
    name: 'Precision Digital Thermostat Submersible Heater 200W',
    price: 1499,
    quantity: 1,
    image: '/hero-products/pet_bowl.png'
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states for validation checkmarks
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');

  const phoneDigits = phone.replace(/\D/g, '').length;
  const isValidPhone = phoneDigits === 10;
  const isInvalidPhone = phoneDigits > 10;
  
  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidZip = zipCode.trim().length >= 5;

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST mock
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSubmitted) {
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    
    // Generate some random confetti particles
    const particles = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 15) * (Math.PI / 180);
      const velocity = 50 + Math.random() * 40;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      const colors = ['#E7A03B', '#1B3C35', '#FBF7EE', '#4CAF50'];
      return { id: i, tx: `${tx}px`, ty: `${ty}px`, color: colors[i % colors.length] };
    });

    return (
      <main className={styles.container}>
        <div className={styles.successWrapper}>
          
          <div className={styles.confettiContainer}>
            {particles.map(p => (
              <div 
                key={p.id} 
                className={styles.particle} 
                style={{ 
                  backgroundColor: p.color, 
                  '--tx': p.tx, 
                  '--ty': p.ty 
                } as React.CSSProperties} 
              />
            ))}
          </div>

          <div className={styles.successIconBadge}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B3C35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.animatedCheck}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h1 className={styles.successTitle}>Order Placed Successfully</h1>
          <p className={styles.successSubtitle}>
            Thank you for shopping with KickAt. We've sent a confirmation email with tracking details to your inbox.
          </p>

          <div className={styles.successCard}>
            <div className={styles.successCardHeader}>
              <div className={styles.cardHeaderItem}>
                <span className={styles.cardHeaderLabel}>Order Number</span>
                <span className={styles.cardHeaderValueMono}>#ORD-{orderNumber}</span>
              </div>
              <div className={styles.cardHeaderItem} style={{ alignItems: 'flex-end' }}>
                <span className={styles.cardHeaderLabel}>Total Amount</span>
                <span className={styles.cardHeaderValue}>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.successItemsList}>
              {checkoutItems.map((item) => (
                <div key={item.id} className={styles.successItem}>
                  <div className={styles.successItemThumb}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.successItemDetails}>
                    <div className={styles.successItemName}>{item.name}</div>
                    <div className={styles.successItemMeta}>Qty: {item.quantity}</div>
                  </div>
                  <div className={styles.successItemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.deliveryEstimate}>
              <Truck size={20} color="#111" strokeWidth={1.5} />
              <span>Arriving Aug 28 – Aug 30</span>
            </div>
          </div>

          <div className={styles.successCtaGroup}>
            <Link href="/account" className={styles.successBtn}>
              View Order Status
            </Link>
            <div className={styles.secondaryActions}>
              <Link href="/shop" className={styles.textLink}>
                Continue Shopping <ArrowRight size={16} />
              </Link>
              <button className={styles.outlineBtn}>Download Invoice</button>
            </div>
          </div>
          
        </div>
      </main>
    );
  }

  return (
    <div className={styles.pageBg}>
      <main className={styles.container}>
        
        <div className={styles.checkoutHeader}>
          <Link href="/cart" className={styles.titleIcon}>
            <ArrowLeft size={28} />
          </Link>
          <h1 className={styles.title}>Checkout</h1>
        </div>

        <div className={styles.stepperContainer}>
          <div className={`${styles.stepItem} ${styles.completed}`}>
            <span className={styles.stepIcon}><Check size={12} strokeWidth={3} /></span> Cart
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.stepItem} ${styles.active}`}>
            <span className={styles.stepIcon}>2</span> Address
          </div>
          <div className={styles.stepDivider}></div>
          <div className={styles.stepItem}>
            <span>3</span> Payment
          </div>
          <div className={styles.stepDivider}></div>
          <div className={styles.stepItem}>
            <span>4</span> Confirm
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
          {/* Left Column: Forms */}
          <div className={styles.formsColumn}>
            
            {/* Step 1: Contact Info */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><User size={20} color="#111" /> 1. Contact Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={styles.input} placeholder="e.g. Eduard" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={styles.input} placeholder="e.g. Franz" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone</label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.phonePrefix}>
                      <span>🇮🇳</span>
                      <span>+91</span>
                      <ChevronDown size={14} />
                    </div>
                    <div className={styles.verticalDivider}></div>
                    <input type="tel" required className={`${styles.input} ${styles.inputWithPrefix} ${isValidPhone ? styles.inputValid : ''} ${isInvalidPhone ? styles.inputInvalid : ''}`} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    {isValidPhone && <Check size={18} color="#4CAF50" className={styles.inputIconRight} />}
                    {isInvalidPhone && <X size={18} color="#F44336" className={styles.inputIconRight} />}
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>E-mail</label>
                  <div className={styles.inputWrapper}>
                    <input type="email" required className={`${styles.input} ${isValidEmail ? styles.inputValid : ''}`} placeholder="e.g. email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {isValidEmail && <Check size={18} color="#4CAF50" className={styles.inputIconRight} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Home Address */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><MapPin size={20} color="#111" /> 2. Home Address</h2>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Flat, House no.</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={styles.input} placeholder="e.g. Flat 101" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Building, Company, Apartment</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" className={styles.input} placeholder="e.g. Sunshine Apartments" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Area, Street, Sector, Village</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={styles.input} placeholder="Street Address" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>City</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={styles.input} placeholder="Mumbai" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>State</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={styles.input} placeholder="e.g. Maharashtra" />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Zip Code</label>
                  <div className={styles.inputWrapper}>
                    <input type="text" required className={`${styles.input} ${isValidZip ? styles.inputValid : ''}`} placeholder="400001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                    {isValidZip && <Check size={18} color="#4CAF50" className={styles.inputIconRight} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><CreditCard size={20} color="#111" /> 3. Payment method</h2>
              <div className={styles.methodGrid}>
                <label className={`${styles.methodPill} ${paymentMethod === 'card' ? styles.selected : ''}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className={styles.methodRadio} />
                  <CreditCard size={20} color={paymentMethod === 'card' ? '#E7A03B' : '#666'} />
                  <span className={styles.methodPillLabel}>Card</span>
                  {paymentMethod === 'card' && (
                    <div className={styles.paymentLogos} style={{ marginLeft: 'auto' }}>
                      <svg viewBox="0 0 36 24" width="36" height="24" fill="none"><rect width="36" height="24" rx="4" fill="#E8E8E8"/><path d="M14.654 16.5H12.01l1.658-9h2.643l-1.657 9zm7.042-8.795c-.83-.418-2.215-.658-3.414-.658-3.663 0-6.242 1.83-6.257 4.453-.014 1.94 1.84 3.02 3.25 3.67 1.437.662 1.92.109 1.92 1.706 0 2.502-3.053 1.054-4.32.483l-.6 2.625c1.135.498 2.97.915 4.9.932 4.025 0 6.637-1.854 6.657-4.717.01-1.573-.97-2.766-3.13-3.72-1.284-.6-2.073-1.002-2.07-1.614.004-.57.653-1.156 2.025-1.156 1.137-.02 1.956.234 2.56.513l.434-2.523zm8.397 5.67L27.653 7.5h-2.51c-.605 0-1.056.173-1.32.8l-4.5 9.2h2.783l.553-1.442h3.39l.322 1.442h2.457c.002.002 1.266-4.125 1.266-4.125zm-2.827-2.6l1.012-2.617c-.015.025.21.577.21.577l.583 2.765h-1.805zM9.467 7.5H6.55L4.475 14.39 3.6 8.358C3.473 7.747 3.01 7.5 2.52 7.5H.115l-.06.273c.48.1 1.026.315 1.37.525.438.267.562.5.66.974l2.218 10.603h2.8l4.364-12.375z" fill="#333"/></svg>
                      <svg viewBox="0 0 36 24" width="36" height="24" fill="none"><rect width="36" height="24" rx="4" fill="#E8E8E8"/><circle cx="13" cy="12" r="7" fill="#333"/><circle cx="23" cy="12" r="7" fill="#666"/><path d="M18 17.143A6.976 6.976 0 0115.857 12 6.976 6.976 0 0118 6.857 6.976 6.976 0 0120.143 12 6.976 6.976 0 0118 17.143z" fill="#999"/></svg>
                    </div>
                  )}
                </label>
                <label className={`${styles.methodPill} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className={styles.methodRadio} />
                  <Smartphone size={20} color={paymentMethod === 'upi' ? '#E7A03B' : '#666'} />
                  <span className={styles.methodPillLabel}>UPI</span>
                </label>
              </div>
            </div>
            
          </div>

          {/* Right Column: Floating Order Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.floatingSummaryCard}>
              <h2 className={styles.summaryTitle}>Order</h2>
              
              <div className={styles.heroProductView}>
                <button type="button" className={`${styles.carouselBtn} ${styles.carouselPrev}`}>
                  <ChevronLeft size={20} />
                </button>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <Image src={checkoutItems[0].image} alt="Hero Product" fill style={{ objectFit: 'contain' }} />
                </div>
                <button type="button" className={`${styles.carouselBtn} ${styles.carouselNext}`}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className={styles.heroProductInfo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className={styles.heroProductName}>{checkoutItems[0].name}</h3>
                  <Link href="/cart" className={styles.editCartLink}><Edit3 size={14} /></Link>
                </div>
                <div className={styles.heroProductMeta}>
                  <span>Size: OS</span>
                  <span>Color: Default</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div className={styles.heroProductPrice}>
                    <span className={styles.originalPrice}>₹2,999</span>
                    <span>₹{checkoutItems[0].price.toLocaleString()}</span>
                  </div>
                  <div className={styles.qtyStepper}>
                    <button type="button" className={styles.qtyBtn}>-</button>
                    <span className={styles.qtyValue}>1</span>
                    <button type="button" className={styles.qtyBtn}>+</button>
                  </div>
                </div>
              </div>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.discountRow}>
                <span>Discount</span>
                <span>-₹0</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              
              <div className={styles.promoContainer}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Have a promo code?</div>
                <div className={styles.promoInputWrapper}>
                  <input type="text" className={styles.promoInput} placeholder="Enter code" />
                  <button type="button" className={styles.promoBtn}>Apply</button>
                </div>
              </div>
              
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              
              <button type="submit" className={styles.placeOrderBtn}>
                Checkout <ArrowRight size={18} />
              </button>
              <span className={styles.microTrustMessage}>
                <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Your payment info is encrypted and secure
              </span>
              
              <div className={styles.trustStrip}>
                <div className={styles.trustText}>
                  <Lock size={14} color="#666" /> Secure SSL Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
