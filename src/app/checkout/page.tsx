"use client";

import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { AnimatedOrderButton } from './AnimatedOrderButton';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Truck, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, CreditCard, Smartphone, ChevronDown, User, MapPin, Lock, Edit3, X, Home, Shield, Plus, Loader2 } from 'lucide-react';
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
  },
  {
    id: '3',
    name: 'Ultra Soft Pet Bed Cushion',
    price: 1299,
    quantity: 1,
    image: '/hero-products/pet_bowl.png'
  },
  {
    id: '4',
    name: 'Interactive Cat Teaser Toy',
    price: 399,
    quantity: 3,
    image: '/hero-products/dog_food.png'
  },
  {
    id: '5',
    name: 'Stainless Steel Non-Slip Pet Bowl',
    price: 499,
    quantity: 2,
    image: '/hero-products/pet_bowl.png'
  },
  {
    id: '6',
    name: 'Adjustable Mesh Dog Harness',
    price: 799,
    quantity: 1,
    image: '/hero-products/dog_food.png'
  }
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for validation checkmarks (pre-filled with dummy data)
  const [firstName, setFirstName] = useState('Eduard');
  const [flat, setFlat] = useState('Flat 101');
  const [street, setStreet] = useState('SABE ROAD');
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('eduard@example.com');
  const [zipCode, setZipCode] = useState('400001');
  
  // Saved Address Toggle for Demo
  const [hasSavedAddress, setHasSavedAddress] = useState(true);
  
  // Promo code toggle state
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  
  // Price details toggle state
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(false);
  
  // Items list toggle state
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '').length;
  const isValidPhone = phoneDigits === 10;
  const isInvalidPhone = phoneDigits > 10;
  
  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidZip = zipCode.trim().length >= 5;

  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST mock
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + tax + shipping;
  const totalItemsCount = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);

  const displayedItems = isItemsExpanded ? checkoutItems : checkoutItems.slice(0, 2);
  const hiddenItemsCount = checkoutItems.length - 2;

  const [orderNumber, setOrderNumber] = useState(0);
  const [particles, setParticles] = useState<{id: number, tx: string, ty: string, color: string}[]>([]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCity(val);
    if (val.toLowerCase().trim() === 'mumbai') {
      setStateName('Maharashtra');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
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
        
        <div className={styles.headerRow}>
          <div className={styles.checkoutHeader}>
            <Link href="/cart" className={styles.titleIcon}>
              <ArrowLeft size={28} />
            </Link>
            <h1 className={styles.title}>Checkout</h1>
          </div>

          <div className={styles.stepperContainer}>
            <div 
              className={`${styles.stepItem} ${currentStep >= 1 ? styles.active : ''}`}
              onClick={() => setCurrentStep(1)}
              style={{ cursor: 'pointer' }}
            >
              <span className={currentStep >= 1 ? styles.stepIcon : styles.stepIconOutline}>1</span> Shipping
            </div>
            <div className={styles.stepDivider}></div>
            <div className={`${styles.stepItem} ${currentStep >= 2 ? styles.active : ''}`}>
              <span className={currentStep >= 2 ? styles.stepIcon : styles.stepIconOutline}>2</span> Payment
            </div>
            <div className={styles.stepDivider}></div>
            <div className={`${styles.stepItem} ${currentStep >= 3 ? styles.active : ''}`}>
              <span className={currentStep >= 3 ? styles.stepIcon : styles.stepIconOutline}>3</span> Review
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.checkoutLayout}>
          {/* Left Column: Forms */}
          <div className={styles.formsColumn}>
            
            <div className={styles.mainCard}>
              {currentStep === 1 && (
              <div className={styles.mainCardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <h2 className={styles.mainCardTitle}>Delivery Address</h2>
                    <p className={styles.mainCardSubtitle}>Your order will be delivered to this address</p>
                  </div>
                  {currentStep === 1 && hasSavedAddress && (
                    <button type="button" className={styles.editChangeBtn} onClick={() => setHasSavedAddress(false)}>
                      <Edit3 size={14} /> Edit / Change
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* Step 1: Address Container */}
              <div className={styles.stepContainerAlt}>
                {currentStep === 3 && (
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
                    
                    {hasSavedAddress ? (
                      <div className={styles.savedAddressContainer}>
                        <div className={styles.savedAddressBlock}>
                          <div className={styles.savedAddressTop}>
                            <div className={styles.homeIconWrapper}><Home size={24} color="#f97316" /></div>
                            <div className={styles.savedAddressDetails}>
                              <div className={styles.savedAddressName}>Sahil Hode <span className={styles.homeTag}>Home</span></div>
                              <div className={styles.savedAddressText}>
                                Marleshwar Apartment, Diva Sabe Gaon, Diva Road (E),<br/>
                                Sabe Road, Sabe Gaon, Kalyan - 400612, Maharashtra
                              </div>
                              <div className={styles.savedAddressPhone}>8652601566</div>
                            </div>
                          </div>
                          <div className={styles.savedAddressDivider}></div>
                          <div className={styles.savedAddressFeatures}>
                            <div className={styles.featureItem}>
                              <div className={styles.featureIconGreen}><Check size={16} strokeWidth={3} color="#10b981" /></div>
                              <div><strong>Delivery here</strong><br/><span>Usually in 24-48 hrs</span></div>
                            </div>
                            <div className={styles.featureItem}>
                              <div className={styles.featureIcon}><MapPin size={16} /></div>
                              <div><strong>Near you</strong><br/><span>Kalyan, Maharashtra</span></div>
                            </div>
                            <div className={styles.featureItem}>
                              <div className={styles.featureIcon}><Shield size={16} /></div>
                              <div><strong>Safe & Secure</strong><br/><span>100% Secure Delivery</span></div>
                            </div>
                          </div>
                        </div>
                        
                        <button type="button" className={styles.addNewAddressBtn} onClick={() => setHasSavedAddress(false)}>
                          <Plus size={16} /> Add New Address
                        </button>
                        
                        <button type="button" className={styles.nextStepBtnAlt} onClick={() => setCurrentStep(2)} style={{ marginTop: '1.5rem' }}>
                          Proceed to Payment <ChevronRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
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
                          <input type="text" required className={styles.input} placeholder="e.g. Franz" defaultValue="Franz" />
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
                        <label className={styles.labelAlt}>Building, Company</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" className={styles.inputAlt} placeholder="e.g. Sunshine Apartments" defaultValue="Sunshine Apartments" />
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
                          <input type="text" required className={styles.input} placeholder="Mumbai" value={city} onChange={handleCityChange} />
                        </div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.labelAlt}>State</label>
                        <div className={styles.inputWrapper}>
                          <input type="text" required className={styles.inputAlt} placeholder="Maharashtra" value={stateName} onChange={(e) => setStateName(e.target.value)} />
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
                      </>
                    )}
                </div>
              )}
            </div>

            {/* Step 2: Payment Container */}
            {currentStep === 2 && (
              <div className={styles.stepContainerAlt} style={{ marginTop: 0 }}>
                <div className={`${styles.stepHeader} ${styles.activeStepHeader}`}>
                  <div className={styles.stepHeaderTitle}>
                    <span className={styles.stepNumberBadge}>2</span>
                    Payment Method
                  </div>
                </div>
                
                <div className={styles.stepBodyAlt}>
                  <div className={styles.paymentMethodsList}>
                    
                    {/* Card Option */}
                    <div className={`${styles.paymentOptionCard} ${paymentMethod === 'card' ? styles.selected : ''}`}>
                      <div className={styles.paymentOptionHeader} onClick={() => setPaymentMethod('card')}>
                        <div className={styles.paymentOptionIcon}>
                          <CreditCard size={20} />
                        </div>
                        <div className={styles.paymentOptionDetails}>
                          <p className={styles.paymentOptionTitle}>Credit or Debit Card</p>
                          <p className={styles.paymentOptionSubtitle}>Pay securely with your bank card</p>
                        </div>
                        <div className={styles.paymentRadioCircle}>
                          <div className={styles.paymentRadioDot}></div>
                        </div>
                      </div>
                      
                      {paymentMethod === 'card' && (
                        <div className={styles.paymentOptionBody}>
                          <input type="text" className={styles.dummyInput} placeholder="Card Number (e.g. 4242 4242 4242 4242)" />
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <input type="text" className={styles.dummyInput} placeholder="MM/YY" style={{ marginTop: 0 }} />
                            <input type="text" className={styles.dummyInput} placeholder="CVC" style={{ marginTop: 0 }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* UPI Option */}
                    <div className={`${styles.paymentOptionCard} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                      <div className={styles.paymentOptionHeader} onClick={() => setPaymentMethod('upi')}>
                        <div className={styles.paymentOptionIcon}>
                          <Smartphone size={20} />
                        </div>
                        <div className={styles.paymentOptionDetails}>
                          <p className={styles.paymentOptionTitle}>UPI ID / QR</p>
                          <p className={styles.paymentOptionSubtitle}>Google Pay, PhonePe, Paytm, etc.</p>
                        </div>
                        <div className={styles.paymentRadioCircle}>
                          <div className={styles.paymentRadioDot}></div>
                        </div>
                      </div>
                      
                      {paymentMethod === 'upi' && (
                        <div className={styles.paymentOptionBody}>
                          <input type="text" className={styles.dummyInput} placeholder="Enter your UPI ID (e.g. name@okhdfcbank)" />
                        </div>
                      )}
                    </div>

                    {/* COD Option */}
                    <div className={`${styles.paymentOptionCard} ${paymentMethod === 'cod' ? styles.selected : ''}`}>
                      <div className={styles.paymentOptionHeader} onClick={() => setPaymentMethod('cod')}>
                        <div className={styles.paymentOptionIcon}>
                          <Truck size={20} />
                        </div>
                        <div className={styles.paymentOptionDetails}>
                          <p className={styles.paymentOptionTitle}>Cash on Delivery</p>
                          <p className={styles.paymentOptionSubtitle}>Pay with cash when your order arrives</p>
                        </div>
                        <div className={styles.paymentRadioCircle}>
                          <div className={styles.paymentRadioDot}></div>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  <button 
                    type="submit" 
                    className={styles.nextStepBtnAlt}
                    style={{ marginTop: '2rem' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Loader2 className={styles.spinnerIcon} size={18} /> Processing Order...
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Lock size={18} /> Place Order Securely
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            </div>
            
          </div>

          {/* Right Column: Floating Order Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.floatingSummaryCard}>
              <h2 className={styles.summaryTitleAlt} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Order Summary
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>({totalItemsCount} items)</span>
              </h2>
              
              <div className={styles.checkoutStaticList}>
                {displayedItems.map((item) => (
                  <div key={item.id} className={styles.staticProductCard}>
                    <div className={styles.staticProductImage}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain' }} />
                    </div>
                    <div className={styles.staticProductInfo}>
                      <div className={styles.staticProductTop}>
                        <h3 className={styles.staticProductName}>{item.name}</h3>
                        <div className={styles.staticProductPrice}>₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                      <div className={styles.staticProductQty}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              {hiddenItemsCount > 0 && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <button 
                    type="button"
                    onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                    className={styles.expandItemsBtn}
                  >
                    {isItemsExpanded ? 'Show less ↑' : `+ ${hiddenItemsCount} more items ↓`}
                  </button>
                </div>
              )}

              <div className={styles.priceDetailsToggle} onClick={() => setIsPriceDetailsOpen(!isPriceDetailsOpen)}>
                <span>Price Details</span>
                <ChevronDown 
                  size={16} 
                  color="#888" 
                  style={{ transform: isPriceDetailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
                />
              </div>

              {isPriceDetailsOpen && (
                <div className={styles.priceDetailsDropdown}>
                  <div className={styles.summaryRowAlt}>
                    <span>Subtotal</span>
                    <span className={styles.summaryValueAlt}>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className={styles.summaryRowAlt}>
                    <span>Discount</span>
                    <span className={styles.discountValueAlt}>-₹0</span>
                  </div>
                  <div className={styles.summaryRowAlt}>
                    <span>Shipping</span>
                    <span className={styles.shippingValueAlt}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                </div>
              )}
              
              <div className={styles.promoContainerAlt}>
                <div className={styles.promoHeaderAlt} onClick={() => setIsPromoOpen(!isPromoOpen)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    Have a promo code?
                  </div>
                  <ChevronDown 
                    size={16} 
                    color="#888" 
                    style={{ transform: isPromoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
                  />
                </div>
                {isPromoOpen && (
                  <div className={styles.promoInputWrapperAlt}>
                    <input type="text" className={styles.promoInputAlt} placeholder="Enter code" />
                    <button type="button" className={styles.promoBtnAlt}>Apply</button>
                  </div>
                )}
              </div>
              
              <div className={styles.totalRowAlt}>
                <span className={styles.totalLabelAlt}>Total <span style={{fontSize:'0.75rem', fontWeight:'normal', color:'#888'}}>(incl. taxes)</span></span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              
              <div className={styles.sslFooter}>
                <Lock size={12} /> Secure 256-bit SSL checkout
              </div>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
