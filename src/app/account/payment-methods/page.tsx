"use client";

import { useState, Suspense } from 'react';
import { CreditCard, Plus, ShieldCheck, Lock, Trash2, Smartphone } from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';

function PaymentMethodsContent() {
  const [methods, setMethods] = useState<any[]>([
    { id: 1, type: 'Card', last4: '4242', network: 'Visa', isDefault: true, expiry: '12/28' },
    { id: 2, type: 'UPI', upiId: 'kickatmember@okicici', isDefault: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = () => {
    setMethods(methods.filter(m => m.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <>
      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageH1}>Payment Methods</h1>
            <p className={styles.pageSubtitle}>Manage your saved cards and UPI IDs securely</p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />}>Add Payment Method</Button>
        </div>

        <div className={styles.trustBanner}>
          <ShieldCheck size={20} className={styles.trustIcon} />
          <div className={styles.trustText}>
            <strong>100% Secure Payments</strong>
            <span>Your payment details are encrypted and securely stored following RBI guidelines.</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.paymentList}>
            <Skeleton style={{ height: 100 }} />
            <Skeleton style={{ height: 100 }} />
          </div>
        ) : (
          <div className={styles.paymentList}>
            {methods.map(method => (
              <div key={method.id} className={styles.paymentCard}>
                <div className={styles.paymentLeft}>
                  <div className={styles.paymentIconWrap}>
                    {method.type === 'Card' ? <CreditCard size={20} /> : <Smartphone size={20} />}
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.paymentTitleRow}>
                      <span className={styles.paymentTitle}>
                        {method.type === 'Card' ? `${method.network} ending in ${method.last4}` : 'UPI ID'}
                      </span>
                      {method.isDefault && <span className={styles.paymentDefaultBadge}>Default</span>}
                    </div>
                    <span className={styles.paymentSub}>
                      {method.type === 'Card' ? `Expires ${method.expiry}` : method.upiId}
                    </span>
                  </div>
                </div>
                
                <div className={styles.paymentActions}>
                  <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteId(method.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={deleteId !== null}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger={true}
      />
    </>
  );
}

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <PaymentMethodsContent />
    </Suspense>
  );
}
