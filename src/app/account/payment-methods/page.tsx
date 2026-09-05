"use client";

import { useState, Suspense } from 'react';
import { 
  CreditCard, Plus, Check, Trash2, X, Sparkles, Smartphone, ShieldCheck, Lock, CheckCircle2
} from 'lucide-react';
import styles from '../Account.module.css';
import cardStyles from './PaymentMethods.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';

const initialUserData = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  memberSince: '2025',
  totalOrders: 12,
  points: 1240,
  tier: 'Gold Paw VIP',
};

const initialCards = [
  {
    id: 'card-1',
    brand: 'Visa',
    type: 'Credit Card',
    last4: '4242',
    holderName: 'Sarah Jenkins',
    expiry: '08/28',
    isDefault: true,
    bgGradient: 'linear-gradient(135deg, #1A1612 0%, #2D2620 100%)'
  },
  {
    id: 'card-2',
    brand: 'Mastercard',
    type: 'Debit Card',
    last4: '8891',
    holderName: 'Sarah Jenkins',
    expiry: '11/27',
    isDefault: false,
    bgGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
  }
];

const initialUpiList = [
  {
    id: 'upi-1',
    vpa: 'sarah.j@okaxis',
    app: 'Google Pay',
    isDefault: true
  },
  {
    id: 'upi-2',
    vpa: '9876543210@ybl',
    app: 'PhonePe',
    isDefault: false
  }
];

function PaymentMethodsContent() {
  const [userData] = useState(initialUserData);
  const [cards, setCards] = useState(initialCards);
  const [upiList, setUpiList] = useState(initialUpiList);
  
  // Modals & Toasts
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFormType, setActiveFormType] = useState<'card' | 'upi'>('card');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Card Form State
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    holderName: '',
    expiry: '',
    cvv: '',
    isDefault: false
  });

  // UPI Form State
  const [upiForm, setUpiForm] = useState({
    vpa: '',
    app: 'UPI App',
    isDefault: false
  });
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardForm(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardForm(prev => ({ ...prev, expiry: `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` }));
    } else {
      setCardForm(prev => ({ ...prev, expiry: cleaned }));
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNumber = cardForm.cardNumber.replace(/\s/g, '');
    const last4 = rawNumber.slice(-4) || '1234';
    const isVisa = rawNumber.startsWith('4');

    const newCard = {
      id: `card-${Date.now()}`,
      brand: isVisa ? 'Visa' : 'Mastercard',
      type: 'Credit Card',
      last4,
      holderName: cardForm.holderName || 'Sarah Jenkins',
      expiry: cardForm.expiry || '12/29',
      isDefault: cardForm.isDefault || cards.length === 0,
      bgGradient: isVisa 
        ? 'linear-gradient(135deg, #1A1612 0%, #2D2620 100%)' 
        : 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)'
    };

    if (newCard.isDefault) {
      setCards(prev => prev.map(c => ({ ...c, isDefault: false })).concat(newCard));
    } else {
      setCards(prev => [...prev, newCard]);
    }

    setCardForm({ cardNumber: '', holderName: '', expiry: '', cvv: '', isDefault: false });
    setIsAddModalOpen(false);
    triggerToast(`New ${newCard.brand} card ending in ${last4} added!`);
  };

  const handleAddUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const newUpi = {
      id: `upi-${Date.now()}`,
      vpa: upiForm.vpa,
      app: upiForm.vpa.includes('@ok') ? 'Google Pay' : upiForm.vpa.includes('@ybl') ? 'PhonePe' : 'BHIM UPI',
      isDefault: upiForm.isDefault || upiList.length === 0
    };

    if (newUpi.isDefault) {
      setUpiList(prev => prev.map(u => ({ ...u, isDefault: false })).concat(newUpi));
    } else {
      setUpiList(prev => [...prev, newUpi]);
    }

    setUpiForm({ vpa: '', app: 'UPI App', isDefault: false });
    setIsUpiVerified(false);
    setIsAddModalOpen(false);
    triggerToast(`UPI ID ${newUpi.vpa} added successfully!`);
  };

  const handleSetDefaultCard = (id: string) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    triggerToast('Default card updated for 1-click checkout.');
  };

  const handleRemoveCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    triggerToast('Card removed.');
  };

  const handleSetDefaultUpi = (id: string) => {
    setUpiList(prev => prev.map(u => ({ ...u, isDefault: u.id === id })));
    triggerToast('Default UPI handle updated.');
  };

  const handleRemoveUpi = (id: string) => {
    setUpiList(prev => prev.filter(u => u.id !== id));
    triggerToast('UPI ID removed.');
  };

  return (
    <div className={styles.pageWrapper}>
      {toastMsg && (
        <div className={styles.toastBanner}>
          <Sparkles size={18} className={styles.toastIcon} />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className={styles.container}>
        <div className={styles.accountLayout}>
          
          {/* Account Sidebar Nav */}
          <AccountSidebarNav user={userData} />

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.tabContentCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.headerTitleRow}>
                  <div>
                    <h1 className={styles.title}>Payment Methods</h1>
                    <p className={styles.subtitle}>Save &amp; manage your cards, UPI handles, and 1-click checkout preferences.</p>
                  </div>
                  <button 
                    type="button" 
                    className={styles.primaryBtn}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus size={16} /> Add Payment Method
                  </button>
                </div>
              </div>

              {/* ── SAVED CARDS SECTION ── */}
              <div className={cardStyles.sectionGroup}>
                <div className={cardStyles.groupTitleRow}>
                  <CreditCard size={18} color="#FD802E" />
                  <h2 className={cardStyles.groupTitle}>Saved Cards</h2>
                </div>

                <div className={cardStyles.cardsGrid}>
                  {cards.map(card => (
                    <div key={card.id} className={cardStyles.paymentCardWrapper}>
                      <div className={cardStyles.luxuryCard} style={{ background: card.bgGradient }}>
                        <div className={cardStyles.cardTopRow}>
                          <div className={cardStyles.chipIcon}>
                            <div className={cardStyles.chipInner} />
                          </div>
                          <span className={cardStyles.brandLogoText}>{card.brand}</span>
                        </div>

                        <div className={cardStyles.cardNumberDisplay}>
                          •••• •••• •••• {card.last4}
                        </div>

                        <div className={cardStyles.cardBottomRow}>
                          <div>
                            <span className={cardStyles.cardSubLabel}>CARDHOLDER</span>
                            <span className={cardStyles.cardSubVal}>{card.holderName}</span>
                          </div>
                          <div>
                            <span className={cardStyles.cardSubLabel}>EXPIRES</span>
                            <span className={cardStyles.cardSubVal}>{card.expiry}</span>
                          </div>
                        </div>
                      </div>

                      <div className={cardStyles.cardFooterBar}>
                        {card.isDefault ? (
                          <span className={styles.defaultPill}>
                            <Check size={11} strokeWidth={3} /> Default Card
                          </span>
                        ) : (
                          <button 
                            type="button" 
                            className={styles.makeDefaultBtn}
                            onClick={() => handleSetDefaultCard(card.id)}
                          >
                            Set Default
                          </button>
                        )}
                        <button 
                          type="button" 
                          className={styles.addressRemoveBtn}
                          onClick={() => handleRemoveCard(card.id)}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SAVED UPI HANDLES SECTION ── */}
              <div className={cardStyles.sectionGroup}>
                <div className={cardStyles.groupTitleRow}>
                  <Smartphone size={18} color="#FD802E" />
                  <h2 className={cardStyles.groupTitle}>UPI Handles &amp; VPA</h2>
                </div>

                <div className={cardStyles.upiList}>
                  {upiList.map(upi => (
                    <div key={upi.id} className={cardStyles.upiRowCard}>
                      <div className={cardStyles.upiIconBadge}>
                        <Smartphone size={18} color="#FD802E" />
                      </div>
                      <div className={cardStyles.upiMetaInfo}>
                        <span className={cardStyles.vpaText}>{upi.vpa}</span>
                        <span className={cardStyles.appSubtext}>{upi.app} • Verified VPA</span>
                      </div>

                      <div className={cardStyles.upiActions}>
                        {upi.isDefault ? (
                          <span className={styles.defaultPill}>
                            <Check size={11} strokeWidth={3} /> Default UPI
                          </span>
                        ) : (
                          <button 
                            type="button" 
                            className={styles.makeDefaultBtn}
                            onClick={() => handleSetDefaultUpi(upi.id)}
                          >
                            Set Default
                          </button>
                        )}
                        <button 
                          type="button" 
                          className={styles.addressRemoveBtn}
                          onClick={() => handleRemoveUpi(upi.id)}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SECURITY BADGE BANNER ── */}
              <div className={cardStyles.securityBanner}>
                <ShieldCheck size={20} color="#15803D" />
                <div className={cardStyles.securityTextGroup}>
                  <strong>256-Bit Encrypted Payments</strong>
                  <span>Your payment information is stored with bank-grade PCI-DSS compliant security. KickAt does not store full credit card CVV details.</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right VIP Snapshot */}
          <aside className={styles.statsPanel}>
            <div className={styles.vipCardHeader}>
              <span className={styles.vipCardTitle}>KICKAT REWARDS</span>
              <span className={styles.vipTierTag}>{userData.tier}</span>
            </div>
            <div className={styles.rewardsProgressBlock}>
              <div className={styles.pointsDisplayRow}>
                <span className={styles.pointsValue}>{userData.points.toLocaleString()}</span>
                <span className={styles.pointsLabel}>Available Paws</span>
              </div>
              <div className={styles.tierProgressBarWrapper}>
                <div className={styles.tierProgressBarFill} style={{ width: '62%' }}></div>
              </div>
              <div className={styles.tierProgressText}>
                <span>620 pts earned</span>
                <span>260 pts to Platinum</span>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* ── MODAL: ADD PAYMENT METHOD ── */}
      {isAddModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <CreditCard size={20} color="#FD802E" />
                <h2>Add Payment Method</h2>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Segmented Selector for Card vs UPI */}
            <div className={cardStyles.modalSegmentRow}>
              <button 
                type="button" 
                className={`${cardStyles.segmentBtn} ${activeFormType === 'card' ? cardStyles.segmentActive : ''}`}
                onClick={() => setActiveFormType('card')}
              >
                <CreditCard size={15} /> Credit / Debit Card
              </button>
              <button 
                type="button" 
                className={`${cardStyles.segmentBtn} ${activeFormType === 'upi' ? cardStyles.segmentActive : ''}`}
                onClick={() => setActiveFormType('upi')}
              >
                <Smartphone size={15} /> UPI Handle
              </button>
            </div>

            {activeFormType === 'card' ? (
              <form onSubmit={handleAddCard} className={styles.modalForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Card Number</label>
                  <div className={styles.pwInputWrapper}>
                    <input 
                      type="text" 
                      required 
                      placeholder="4242 4242 4242 4242"
                      className={styles.modalInput}
                      value={cardForm.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                    />
                    <CreditCard size={18} className={cardStyles.inputRightIcon} />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Cardholder Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Sarah Jenkins"
                    className={styles.modalInput}
                    value={cardForm.holderName}
                    onChange={(e) => setCardForm({ ...cardForm, holderName: e.target.value })}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Expiry (MM/YY)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="08/28"
                      className={styles.modalInput}
                      value={cardForm.expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>CVV Code</label>
                    <input 
                      type="password" 
                      required 
                      maxLength={4}
                      placeholder="•••"
                      className={styles.modalInput}
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <input 
                    type="checkbox"
                    id="isDefaultCardCheck"
                    checked={cardForm.isDefault}
                    onChange={(e) => setCardForm({ ...cardForm, isDefault: e.target.checked })}
                  />
                  <label htmlFor="isDefaultCardCheck">Set as default card for 1-click checkout</label>
                </div>

                <div className={styles.modalFooterActions}>
                  <button type="button" className={styles.actionBtn} onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                    Save Card
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddUpi} className={styles.modalForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Virtual Payment Address (VPA)</label>
                  <div className={styles.pwInputWrapper}>
                    <input 
                      type="text" 
                      required 
                      placeholder="username@okaxis or 9876543210@ybl"
                      className={styles.modalInput}
                      value={upiForm.vpa}
                      onChange={(e) => {
                        setUpiForm({ ...upiForm, vpa: e.target.value });
                        setIsUpiVerified(false);
                      }}
                    />
                    {isUpiVerified && <CheckCircle2 size={18} color="#15803D" className={cardStyles.inputRightIcon} />}
                  </div>
                </div>

                {!isUpiVerified ? (
                  <button 
                    type="button" 
                    className={styles.actionBtn}
                    onClick={() => {
                      if (upiForm.vpa.includes('@')) {
                        setIsUpiVerified(true);
                      } else {
                        alert("Please enter a valid VPA ID (e.g. name@upi)");
                      }
                    }}
                  >
                    Verify UPI Handle
                  </button>
                ) : (
                  <div className={cardStyles.verifiedUpiBox}>
                    <CheckCircle2 size={16} color="#15803D" />
                    <span>UPI Handle Verified &amp; Ready to Save</span>
                  </div>
                )}

                <div className={styles.checkboxGroup}>
                  <input 
                    type="checkbox"
                    id="isDefaultUpiCheck"
                    checked={upiForm.isDefault}
                    onChange={(e) => setUpiForm({ ...upiForm, isDefault: e.target.checked })}
                  />
                  <label htmlFor="isDefaultUpiCheck">Set as default UPI handle</label>
                </div>

                <div className={styles.modalFooterActions}>
                  <button type="button" className={styles.actionBtn} onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                    Save UPI Handle
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading payment methods...</div>}>
      <PaymentMethodsContent />
    </Suspense>
  );
}
