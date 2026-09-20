"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Check, Trash2, Home, Briefcase, ArrowLeft, X } from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UseLocationButton } from '@/components/ui/UseLocationButton';
import { DetectedAddress } from '@/services/locationService';
import { profileService } from '@/services/profileService';

function SavedAddressesContent() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New Address Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHouseFlat, setFormHouseFlat] = useState('');
  const [formAddressLine, setFormAddressLine] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formLabel, setFormLabel] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [formIsDefault, setFormIsDefault] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res: any = await profileService.getProfile();
      if (res && res.user && Array.isArray(res.user.addresses)) {
        setAddresses(res.user.addresses);
      } else if (res && Array.isArray(res.addresses)) {
        setAddresses(res.addresses);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormHouseFlat('');
    setFormAddressLine('');
    setFormCity('');
    setFormState('');
    setFormPin('');
    setFormLabel('HOME');
    setFormIsDefault(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCity || !formPin || !formAddressLine) {
      alert('Please fill in Street Address, City, and PIN code.');
      return;
    }

    setSubmitting(true);
    try {
      await profileService.addAddress({
        type: formLabel,
        houseFlat: formHouseFlat || undefined,
        buildingStreet: formAddressLine,
        city: formCity,
        state: formState || 'Maharashtra',
        pincode: formPin,
        isDefault: formIsDefault
      });
      await fetchAddresses();
      resetForm();
      setIsAddOpen(false);
    } catch (err: any) {
      console.error('Error adding address:', err);
      alert(err?.message || 'Failed to save address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationDetected = (addr: DetectedAddress) => {
    if (addr.pincode) setFormPin(addr.pincode);
    if (addr.city) setFormCity(addr.city);
    if (addr.state) setFormState(addr.state);
    if (addr.street) setFormAddressLine(addr.street);
    if (addr.houseFlat) setFormHouseFlat(addr.houseFlat);
  };

  const getIcon = (label: string) => {
    const upper = (label || '').toUpperCase();
    if (upper === 'HOME') return <Home size={14} />;
    if (upper === 'WORK') return <Briefcase size={14} />;
    return <MapPin size={14} />;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await profileService.deleteAddress(String(deleteId));
      await fetchAddresses();
    } catch (err: any) {
      console.error('Failed to delete address:', err);
      alert(err?.message || 'Failed to delete address');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className={styles.backHeaderGroup}>
        <Link href="/account" className={styles.backToAccountBtn}>
          <ArrowLeft size={18} />
          <span>Back to Account</span>
        </Link>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageH1}>Saved Addresses</h1>
            <p className={styles.pageSubtitle}>Manage your delivery locations for faster checkout</p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsAddOpen(true)}>Add New Address</Button>
        </div>

        {loading ? (
          <div className={styles.addressGrid}>
            <Skeleton style={{ height: 200 }} />
            <Skeleton style={{ height: 200 }} />
          </div>
        ) : addresses.length > 0 ? (
          <div className={styles.addressGrid}>
            {addresses.map(addr => (
              <div key={addr.id} className={styles.addressCard}>
                <div className={styles.addressHeaderRow}>
                  <div className={styles.addressLabelGroup}>
                    {getIcon(addr.type || addr.label)}
                    <span className={styles.addressLabelText}>{addr.type || addr.label || 'Home'}</span>
                  </div>
                  {addr.isDefault && <Badge variant="delivered">Default</Badge>}
                </div>
                
                <div className={styles.addressBody}>
                  <p className={styles.addressName}>{addr.name || 'Saved Address'}</p>
                  <p className={styles.addressText}>{addr.houseFlat ? `${addr.houseFlat}, ` : ''}{addr.buildingStreet || addr.addressLine}</p>
                  <p className={styles.addressText}>{addr.city}, {addr.state} {addr.pincode || addr.pin}</p>
                  {addr.phone && <p className={styles.addressPhone}>{addr.phone}</p>}
                </div>

                <div className={styles.addressFooterRow}>
                  <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteId(addr.id)}>Remove</Button>
                </div>
              </div>
            ))}
            
            <button className={styles.addAddressDashedCard} onClick={() => setIsAddOpen(true)}>
              <div className={styles.dashedCardInner}>
                <Plus size={24} className={styles.dashedIcon} />
                <span className={styles.dashedText}>Add New Address</span>
              </div>
            </button>
          </div>
        ) : (
          <EmptyState
            icon={<MapPin size={48} />}
            title="No saved addresses found"
            description="You haven't saved any delivery addresses yet."
            action={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsAddOpen(true)}>Add Address</Button>}
          />
        )}
      </div>

      {/* Left-Side Slide-Out Drawer for Add New Address */}
      {isAddOpen && (
        <div className={styles.leftDrawerBackdrop} onClick={() => setIsAddOpen(false)}>
          <div className={styles.leftDrawerPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.leftDrawerHeader}>
              <h2 className={styles.leftDrawerTitle}>Add New Address</h2>
              <button 
                type="button" 
                className={styles.leftDrawerCloseBtn} 
                onClick={() => setIsAddOpen(false)}
                aria-label="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className={styles.leftDrawerBody}>
                {/* Location Detection Button */}
                <UseLocationButton onLocationDetected={handleLocationDetected} />

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sahil Hode" 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="98765 43210" 
                    value={formPhone} 
                    onChange={e => setFormPhone(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Flat / House No. / Building</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Flat 402, Sunshine Heights" 
                    value={formHouseFlat} 
                    onChange={e => setFormHouseFlat(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Street Address / Landmark *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. MG Road, Near City Mall" 
                    value={formAddressLine} 
                    onChange={e => setFormAddressLine(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formRow2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Mumbai" 
                      value={formCity} 
                      onChange={e => setFormCity(e.target.value)} 
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>State</label>
                    <input 
                      type="text" 
                      placeholder="Maharashtra" 
                      value={formState} 
                      onChange={e => setFormState(e.target.value)} 
                      className={styles.formInput} 
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>PIN Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="400001" 
                    value={formPin} 
                    onChange={e => setFormPin(e.target.value)} 
                    className={styles.formInput} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Address Type</label>
                  <div className={styles.addressTypeGroup}>
                    {(['HOME', 'WORK', 'OTHER'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`${styles.addressTypeBtn} ${formLabel === type ? styles.addressTypeActive : ''}`}
                        onClick={() => setFormLabel(type)}
                      >
                        {type === 'HOME' && <Home size={14} />}
                        {type === 'WORK' && <Briefcase size={14} />}
                        {type === 'OTHER' && <MapPin size={14} />}
                        <span>{type === 'HOME' ? 'Home' : type === 'WORK' ? 'Work' : 'Other'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1E1B18' }}>
                    <input 
                      type="checkbox" 
                      checked={formIsDefault} 
                      onChange={e => setFormIsDefault(e.target.checked)} 
                    />
                    Make this my default delivery address
                  </label>
                </div>
              </div>

              <div className={styles.leftDrawerFooter}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => setIsAddOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteId !== null}
        title="Remove Address"
        message="Are you sure you want to remove this address? You can't undo this action."
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger={true}
      />
    </>
  );
}

export default function SavedAddressesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <SavedAddressesContent />
    </Suspense>
  );
}
