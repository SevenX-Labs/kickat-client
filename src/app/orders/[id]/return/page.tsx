"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  ArrowLeft, 
  AlertCircle, 
  Package, 
  Loader2 
} from 'lucide-react';
import styles from './ReturnFlow.module.css';
import { orderService, Order } from '@/services/orderService';
import { returnsService } from '@/services/returnsService';
import { ReturnReason } from '@/types/returns';

const REASON_OPTIONS: { label: string; value: ReturnReason }[] = [
  { label: 'Item arrived damaged or defective', value: 'damaged' },
  { label: 'Wrong item was delivered', value: 'wrong_item' },
  { label: 'Product expired or close to expiry', value: 'expired' },
  { label: 'Item not as described on website', value: 'not_as_described' },
  { label: 'Other issue', value: 'other' },
];

export default function ReturnFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; reason: ReturnReason; reasonOther: string }>>({});
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdReturnId, setCreatedReturnId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getOrderById(orderId);
        if (res && res.success && res.order) {
          const ord = res.order;
          setOrder(ord);

          // Initialize selected items state
          const initialMap: Record<string, { selected: boolean; reason: ReturnReason; reasonOther: string }> = {};
          (ord.items || []).forEach((item: any, idx: number) => {
            // Select all by default or first item
            initialMap[item.id] = {
              selected: true,
              reason: 'damaged',
              reasonOther: '',
            };
          });
          setSelectedItems(initialMap);
        } else {
          setError('Order could not be loaded.');
        }
      } catch (err: any) {
        console.error('Failed to load order:', err);
        setError(err?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selected: !prev[itemId]?.selected,
      },
    }));
  };

  const updateItemReason = (itemId: string, reason: ReturnReason) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        reason,
      },
    }));
  };

  const updateItemReasonOther = (itemId: string, reasonOther: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        reasonOther,
      },
    }));
  };

  const activeSelectedItems = Object.entries(selectedItems)
    .filter(([_, data]) => data.selected)
    .map(([id, data]) => ({ orderItemId: id, ...data }));

  const calculateSelectedTotal = () => {
    if (!order || !order.items) return 0;
    return order.items
      .filter((item) => selectedItems[item.id]?.selected)
      .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (activeSelectedItems.length === 0) {
        alert('Please select at least one item to return.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setSubmitting(true);
      setError(null);
      try {
        const payload = {
          items: activeSelectedItems.map((it) => ({
            orderItemId: it.orderItemId,
            reason: it.reason,
            reasonOther: it.reasonOther ? it.reasonOther.trim() : undefined,
          })),
          pickupInstructions: pickupInstructions.trim() ? pickupInstructions.trim() : undefined,
        };

        const res = await returnsService.createReturn(orderId, payload);
        if (res && res.success) {
          setCreatedReturnId(res.return?.id || null);
          setStep(3);
        } else {
          alert(res?.message || 'Failed to submit return request.');
        }
      } catch (err: any) {
        console.error('Failed to submit return:', err);
        alert(err?.message || 'Failed to submit return request.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container} style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#E7A03B' }} />
          <p style={{ color: '#666' }}>Loading order items...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className={styles.main}>
        <div className={styles.container} style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unable to Return Order</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{error || 'Order details could not be found.'}</p>
          <Link href="/orders" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#111', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const isDelivered = (order.orderStatus || order.status || '').toUpperCase() === 'DELIVERED';

  if (!isDelivered) {
    return (
      <main className={styles.main}>
        <div className={styles.container} style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Order Not Yet Delivered</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Returns can only be requested after your package has been marked as Delivered.
            Current status: <strong>{order.orderStatus || order.status}</strong>
          </p>
          <Link href={`/orders/${orderId}`} style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#111', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
            View Order Tracking
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ marginBottom: '1rem' }}>
            <Link href={`/orders/${orderId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
              <ArrowLeft size={14} /> Back to Order
            </Link>
          </div>
          <h1 className={styles.title}>
            {step === 1 && "Select Items to Return"}
            {step === 2 && "Pickup & Refund Details"}
            {step === 3 && "Return Requested!"}
          </h1>
          <p className={styles.subtitle}>
            {step === 1 && "Choose which items you would like to return and tell us what went wrong."}
            {step === 2 && "Confirm pickup notes and refund breakdown."}
            {step === 3 && "We've received your request and will process it shortly."}
          </p>
        </div>

        <div className={styles.formContent}>
          
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {order.items?.map((item) => {
                  const isSelected = selectedItems[item.id]?.selected;
                  const itemReason = selectedItems[item.id]?.reason || 'damaged';
                  const reasonOther = selectedItems[item.id]?.reasonOther || '';

                  return (
                    <div 
                      key={item.id} 
                      style={{
                        border: isSelected ? '1.5px solid #E7A03B' : '1px solid #eaeaea',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        background: isSelected ? '#fffcf8' : '#fafafa',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleItemSelection(item.id)}
                          style={{ width: '18px', height: '18px', accentColor: '#E7A03B', cursor: 'pointer' }}
                        />
                        <div className={styles.itemImageWrapper}>
                          {item.imageUrl || item.image ? (
                            <SafeImage 
                              src={item.imageUrl || item.image} 
                              productName={item.productName}
                              alt={item.productName} 
                              fill 
                              style={{ objectFit: 'contain', padding: '0.25rem' }} 
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#111', fontSize: '0.95rem' }}>{item.productName}</div>
                          {item.variantName && (
                            <div style={{ fontSize: '0.8rem', color: '#777' }}>Variant: {item.variantName}</div>
                          )}
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
                            Qty: {item.quantity} • ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                          <label className={styles.label}>Reason for Return</label>
                          <select 
                            className={styles.reasonSelect} 
                            value={itemReason} 
                            onChange={(e) => updateItemReason(item.id, e.target.value as ReturnReason)}
                          >
                            {REASON_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {itemReason === 'other' && (
                            <>
                              <label className={styles.label}>Please describe the reason</label>
                              <input
                                type="text"
                                className={styles.reasonSelect}
                                placeholder="Explain briefly why you are returning this item"
                                value={reasonOther}
                                onChange={(e) => updateItemReasonOther(item.id, e.target.value)}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className={styles.label}>Pickup Instructions (Optional)</label>
              <textarea 
                className={styles.textarea} 
                placeholder="E.g., Call before pickup, leave with security gate, morning pickup preferred..."
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                maxLength={500}
              />

              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#fafafa', borderRadius: '16px', border: '1px solid #eee' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111' }}>Return & Refund Overview</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                  <span>Selected Items ({activeSelectedItems.length})</span>
                  <span style={{ fontWeight: 600, color: '#111' }}>₹{calculateSelectedTotal().toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eaeaea', paddingTop: '0.75rem', marginTop: '0.75rem', fontWeight: 700, fontSize: '1rem', color: '#111' }}>
                  <span>Estimated Refund</span>
                  <span style={{ color: '#2e7d32' }}>₹{calculateSelectedTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(231, 160, 59, 0.08)', borderRadius: '12px', fontSize: '0.85rem', color: '#b77a25', lineHeight: 1.5 }}>
                Refund will be processed back to your original payment method within 2-4 business days after pickup verification.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.successContainer}>
              <CheckCircle2 size={64} color="#E7A03B" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
              <h2 style={{ marginBottom: '1rem', color: '#111' }}>Return Request Submitted</h2>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your return request has been submitted successfully. Our courier partner will coordinate pickup from your address within 1-2 business days.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {createdReturnId ? (
                  <Link href={`/returns/${createdReturnId}`} style={{ display: 'inline-block', padding: '1rem 2rem', background: '#111', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
                    Track This Return
                  </Link>
                ) : (
                  <Link href="/returns" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#111', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
                    View All Returns
                  </Link>
                )}
                <Link href="/orders" style={{ display: 'inline-block', padding: '1rem 2rem', background: 'white', border: '1.5px solid #eaeaea', color: '#111', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
                  Back to Orders
                </Link>
              </div>
            </div>
          )}

        </div>

        {step < 3 && (
          <div className={styles.footer}>
            <button 
              className={styles.btnBack} 
              onClick={() => step === 1 ? router.push(`/orders/${orderId}`) : setStep(1)}
              disabled={submitting}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button 
              className={styles.btnNext} 
              onClick={handleNext}
              disabled={submitting || (step === 1 && activeSelectedItems.length === 0)}
              style={{ opacity: submitting || (step === 1 && activeSelectedItems.length === 0) ? 0.7 : 1 }}
            >
              {submitting ? 'Submitting...' : step === 2 ? 'Submit Return Request' : 'Continue'}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
