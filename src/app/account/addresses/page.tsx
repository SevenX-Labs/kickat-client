"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Plus, Check, Trash2, X, Sparkles 
} from 'lucide-react';
import styles from '../Account.module.css';
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

const initialAddresses = [
  {
    id: 'addr-1',
    type: 'Home',
    isDefault: true,
    fullName: 'Sarah Jenkins',
    addressLine: '123 Pet Lover Lane, Block B, Near Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '+91 98765 43210'
  }
];

function SavedAddressesContent() {
  const router = useRouter();
  const [userData] = useState(initialUserData);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    fullName: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr = {
      id: `addr-${Date.now()}`,
      type: addressForm.type,
      isDefault: addressForm.isDefault || addresses.length === 0,
      fullName: addressForm.fullName || `${userData.firstName} ${userData.lastName}`,
      addressLine: addressForm.addressLine,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      phone: addressForm.phone || '+91 98765 43210'
    };

    if (newAddr.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }

    setAddressForm({
      type: 'Home',
      fullName: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
    setIsAddAddressOpen(false);
    triggerToast('New delivery address added!');
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    triggerToast('Address removed.');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    triggerToast('Default address updated.');
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
          
          {/* Reusable Account Navigation */}
          <AccountSidebarNav user={userData} />

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.tabContentCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.headerTitleRow}>
                  <div>
                    <h1 className={styles.title}>Saved Addresses</h1>
                    <p className={styles.subtitle}>Manage shipping destinations for express, one-click checkout.</p>
                  </div>
                  <button 
                    type="button" 
                    className={styles.primaryBtn}
                    onClick={() => setIsAddAddressOpen(true)}
                  >
                    <Plus size={16} /> Add Address
                  </button>
                </div>
              </div>

              <div className={styles.addressesGrid}>
                {addresses.map(addr => (
                  <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardActive : ''}`}>
                    <div className={styles.addressHeaderRow}>
                      <span className={styles.addressTypeBadge}>
                        <MapPin size={12} /> {addr.type}
                      </span>
                      {addr.isDefault ? (
                        <span className={styles.defaultPill}>
                          <Check size={11} strokeWidth={3} /> Default Delivery
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          className={styles.makeDefaultBtn}
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    <div className={styles.addressName}>{addr.fullName}</div>
                    <p className={styles.addressText}>
                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <div className={styles.addressPhone}>Phone: {addr.phone}</div>

                    <div className={styles.addressCardActions}>
                      <button 
                        type="button" 
                        className={styles.addressRemoveBtn}
                        onClick={() => handleRemoveAddress(addr.id)}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
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

      {/* Add Address Modal */}
      {isAddAddressOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsAddAddressOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <MapPin size={20} color="#FD802E" />
                <h2>Add Delivery Address</h2>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setIsAddAddressOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Address Tag</label>
                  <select 
                    className={styles.modalSelect}
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Recipient's name"
                    className={styles.modalInput}
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Street Address / Flat / Building</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 123 Pet Lover Lane, Block B"
                  className={styles.modalInput}
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>City</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Mumbai"
                    className={styles.modalInput}
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>State</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Maharashtra"
                    className={styles.modalInput}
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Pincode</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="400001"
                    className={styles.modalInput}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Contact Phone</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+91 98765 43210"
                    className={styles.modalInput}
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <input 
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                />
                <label htmlFor="isDefaultCheck">Set as default shipping address</label>
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" className={styles.actionBtn} onClick={() => setIsAddAddressOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SavedAddressesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading saved addresses...</div>}>
      <SavedAddressesContent />
    </Suspense>
  );
}
