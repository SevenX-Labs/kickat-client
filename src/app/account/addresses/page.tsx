"use client";

import { useState, Suspense } from 'react';
import { MapPin, Plus, Check, Trash2, Home, Briefcase, ArrowLeft } from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

function SavedAddressesContent() {
  const [addresses, setAddresses] = useState<any[]>([
    { id: 1, label: 'Home', isDefault: true, name: 'KickAt Member', phone: '+91 9876543210', addressLine: '123 Main Street', city: 'Mumbai', state: 'Maharashtra', pin: '400001' },
    { id: 2, label: 'Work', isDefault: false, name: 'KickAt Member', phone: '+91 9876543210', addressLine: '456 Business Park, Office 7', city: 'Mumbai', state: 'Maharashtra', pin: '400051' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getIcon = (label: string) => {
    if (label === 'Home') return <Home size={14} />;
    if (label === 'Work') return <Briefcase size={14} />;
    return <MapPin size={14} />;
  };

  const handleDelete = () => {
    setAddresses(addresses.filter(a => a.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <>
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
        ) : (
          <div className={styles.addressGrid}>
            {addresses.map(addr => (
              <div key={addr.id} className={styles.addressCard}>
                <div className={styles.addressHeaderRow}>
                  <div className={styles.addressLabelGroup}>
                    {getIcon(addr.label)}
                    <span className={styles.addressLabelText}>{addr.label}</span>
                  </div>
                  {addr.isDefault && <Badge variant="delivered">Default</Badge>}
                </div>
                
                <div className={styles.addressBody}>
                  <p className={styles.addressName}>{addr.name}</p>
                  <p className={styles.addressText}>{addr.addressLine}</p>
                  <p className={styles.addressText}>{addr.city}, {addr.state} {addr.pin}</p>
                  <p className={styles.addressPhone}>{addr.phone}</p>
                </div>

                <div className={styles.addressFooterRow}>
                  <Button variant="ghost" size="sm">Edit</Button>
                  {!addr.isDefault && <Button variant="ghost" size="sm">Set Default</Button>}
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
        )}
      </div>

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
