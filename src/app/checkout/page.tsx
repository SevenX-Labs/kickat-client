"use client";

import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { AnimatedOrderButton } from './AnimatedOrderButton';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Truck, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, CreditCard, Smartphone, ChevronDown, User, MapPin, Lock, Edit3, X } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states for validation checkmarks
  const [firstName, setFirstName] = useState('');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
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

  const [orderNumber, setOrderNumber] = useState(0);
  const [particles, setParticles] = useState<{id: number, tx: string, ty: string, color: string}[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitted(true);
    setOrderNumber(Math.floor(100000 + Math.random() * 900000));
    setParticles(Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 15) * (Math.PI / 180);
      const velocity = 50 + Math.random() * 40;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      const colors = ['#E7A03B', '#1B3C35', '#FBF7EE', '#4CAF50'];
      return { id: i, tx: `${tx}px`, ty: `${ty}px`, color: colors[i % colors.length] };
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep1 = () => {
    return isValidPhone && isValidEmail && isValidZip;
  };

  const validateForm = () => {
    return validateStep1() && paymentMethod !== '';
  };

  if (isSubmitted) {

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
            Thank you for shopping with KickAt. We&apos;ve sent a confirmation email with tracking details to your inbox.
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
          <div className={`${styles.stepItem} ${currentStep >= 1 ? styles.active : ''}`}>
            <span className={styles.stepIcon}>1</span> Shipping
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.stepItem} ${currentStep === 2 ? styles.active : ''}`}>
            <span className={styles.stepIconOutline}>2</span> Payment
          </div>
          <div className={styles.stepDivider}></div>
          <div className={styles.stepItem}>
            <span className={styles.stepIconOutline}>3</span> Review
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
          {/* Left Column: Forms */}
          <div className={styles.formsColumn}>
            
            <div className={styles.mainCard}>
              <div className={styles.mainCardHeader}>
                <div className={styles.mainCardIcon}>
                  <MapPin size={24} color="#f97316" />
                </div>
                <div>
                  <h2 className={styles.mainCardTitle}>Shipping Address</h2>
                  <p className={styles.mainCardSubtitle}>Enter your details to get your order delivered</p>
                </div>
              </div>

              {/* Step 1: Address Container */}
              <div className={styles.stepContainerAlt}>
                {currentStep > 1 && (
                <div className={styles.collapsedSummary}>
                  <div className={styles.summaryName}>
                    {firstName || 'Customer'}
                  </div>
                  <div className={styles.summaryAddress}>
                    {[flat, street, city, zipCode].filter(Boolean).join(', ') || 'Address not filled'}
                  </div>
                  <div className={styles.summaryPhone}>{phone}</div>
                </div>
              )}
              
                {currentStep === 1 && (
                  <div className={styles.stepBodyAlt}>
                    {/* Contact Info */}
                    <div className={styles.formSectionAlt}>
                      <h3 className={styles.sectionTitleAlt}><User size={18} strokeWidth={1.5} /> Contact Information</h3>
                      <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>First Name</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.input} placeholder="e.g. Eduard" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Last Name</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.input} placeholder="e.g. Franz" />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.labelAlt}>Phone Number</label>
                        <div className={`${styles.inputWrapper} ${styles.phoneInputWrapper}`}>
                          <div className={styles.phonePrefixAlt}>
                            <span>🇮🇳</span>
                            <span>+91</span>
                            <ChevronDown size={14} color="#888" />
                          </div>
                          <div className={styles.verticalDividerAlt}></div>
                          <input type="tel" required className={`${styles.inputAlt} ${styles.inputWithPrefixAlt} ${isValidPhone ? styles.inputValid : ''} ${isInvalidPhone ? styles.inputInvalid : ''}`} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.labelAlt}>Email Address</label>
                        <div className={styles.inputWrapper}>
                          <input type="email" required className={`${styles.inputAlt} ${isValidEmail ? styles.inputValid : ''}`} placeholder="e.g. email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Home Address */}
                    <div className={styles.formSectionAlt} style={{ marginTop: '2rem' }}>
                      <h3 className={styles.sectionTitleAlt}><MapPin size={18} strokeWidth={1.5} /> Shipping Address</h3>
                      <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Flat, House no.</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.input} placeholder="e.g. Flat 101" value={flat} onChange={(e) => setFlat(e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Building, Company</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" className={styles.input} placeholder="e.g. Sunshine Apartments" />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Street, Sector</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.input} placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>City</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.input} placeholder="Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.labelAlt}>State</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.inputAlt} placeholder="Maharashtra" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.labelAlt}>PIN Code</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={`${styles.inputAlt} ${isValidZip ? styles.inputValid : ''}`} placeholder="400001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.saveAddressToggle}>
                    <label className={styles.customCheckboxContainer}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.checkmark}></span>
                      Save this address for future orders
                    </label>
                  </div>

                  <button 
                    type="button" 
                    className={styles.nextStepBtnAlt}
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                      } else {
                        // Triggers HTML5 validation
                        (document.querySelector('form') as HTMLFormElement)?.reportValidity();
                      }
                    }}
                  >
                    Proceed to Payment <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Container */}
            {currentStep === 2 && (
              <div className={styles.stepContainerAlt}>
                <div className={`${styles.stepHeader} ${styles.activeStepHeader}`}>
                  <div className={styles.stepHeaderTitle}>
                    <span className={styles.stepNumberBadge}>2</span>
                    Payment Method
                  </div>
                </div>
                
                <div className={styles.stepBodyAlt}>
                  <div className={styles.methodGrid}>
                    <label className={`${styles.methodPill} ${paymentMethod === 'card' ? styles.selected : ''}`}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className={styles.methodRadio} />
                      <CreditCard size={20} color={paymentMethod === 'card' ? '#E7A03B' : '#666'} />
                      <span className={styles.methodPillLabel}>Card</span>
                    </label>
                    <label className={`${styles.methodPill} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className={styles.methodRadio} />
                      <Smartphone size={20} color={paymentMethod === 'upi' ? '#E7A03B' : '#666'} />
                      <span className={styles.methodPillLabel}>UPI</span>
                    </label>
                    <label className={`${styles.methodPill} ${paymentMethod === 'cod' ? styles.selected : ''}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className={styles.methodRadio} />
                      <Truck size={20} color={paymentMethod === 'cod' ? '#E7A03B' : '#666'} />
                      <span className={styles.methodPillLabel}>Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
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
              
              <div className={styles.promoContainerAlt}>
                <div className={styles.promoHeaderAlt}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    Have a promo code?
                  </div>
                  <ChevronDown size={16} color="#888" />
                </div>
                <div className={styles.promoInputWrapperAlt}>
                  <input type="text" className={styles.promoInputAlt} placeholder="Enter code" />
                  <button type="button" className={styles.promoBtnAlt}>Apply</button>
                </div>
              </div>
              
              <div className={styles.totalRowAlt}>
                <span className={styles.totalLabelAlt}>Total <span style={{fontSize:'0.75rem', fontWeight:'normal', color:'#888'}}>(incl. taxes)</span></span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem', width: '100%' }}>
                <AnimatedOrderButton 
                  className={styles.placeOrderBtn} 
                  onValidate={() => {
                    if (!validateForm()) {
                      (document.querySelector('form') as HTMLFormElement)?.reportValidity();
                      if (currentStep === 2 && !validateStep1()) {
                        setCurrentStep(1); // Go back to step 1 if invalid there
                      }
                      return false; // Prevents animation
                    }
                    return true;
                  }}
                  onComplete={() => {
                    // This fires after the 8.5s animation completes successfully
                    router.push('/checkout/success');
                  }} 
                />
              </div>
              <div className={styles.sslFooter}>
                <Lock size={12} /> Secure 256-bit SSL checkout
              </div>
            </div>

            <div className={styles.trustBadgesRow}>
              <div className={styles.trustBadgeItem}>
                <div className={styles.trustIconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg></div>
                <div className={styles.trustBadgeTitle}>Safe & Secure</div>
                <div className={styles.trustBadgeDesc}>Payments</div>
              </div>
              <div className={styles.trustBadgeItem}>
                <div className={styles.trustIconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path></svg></div>
                <div className={styles.trustBadgeTitle}>Easy Returns</div>
                <div className={styles.trustBadgeDesc}>7 Days</div>
              </div>
              <div className={styles.trustBadgeItem}>
                <div className={styles.trustIconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                <div className={styles.trustBadgeTitle}>Original Products</div>
                <div className={styles.trustBadgeDesc}>100% Authentic</div>
              </div>
              <div className={styles.trustBadgeItem}>
                <div className={styles.trustIconWrapper}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                <div className={styles.trustBadgeTitle}>Customer Support</div>
                <div className={styles.trustBadgeDesc}>24/7</div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
