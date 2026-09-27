"use client";

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Package, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  ShieldCheck, 
  Clock,
  MapPin
} from 'lucide-react';
import styles from '../Returns.module.css';
import { returnsService } from '@/services/returnsService';
import { ReturnRecord } from '@/types/returns';

function formatReason(reason: string) {
  const map: Record<string, string> = {
    wrong_item: 'Wrong item was delivered',
    damaged: 'Item arrived damaged or defective',
    expired: 'Item was expired',
    not_as_described: 'Product not as described',
    other: 'Other issue',
  };
  return map[reason.toLowerCase()] || reason;
}

export default function ReturnDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const returnId = resolvedParams.id;
  
  const [returnRecord, setReturnRecord] = useState<ReturnRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReturn() {
      if (!returnId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await returnsService.getReturnById(returnId);
        if (res && res.success && res.return) {
          setReturnRecord(res.return);
        } else {
          setError('Return details could not be found.');
        }
      } catch (err: any) {
        console.error('Failed to load return details:', err);
        setError(err?.message || 'Failed to fetch return details.');
      } finally {
        setLoading(false);
      }
    }
    loadReturn();
  }, [returnId]);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/returns" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={14} /> Back to Returns
            </Link>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #eaeaea' }}>
            <p style={{ color: '#666', fontSize: '1rem' }}>Loading return details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !returnRecord) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/returns" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={14} /> Back to Returns
            </Link>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #eaeaea' }}>
            <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Return Not Found</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>{error || 'The requested return record does not exist or has been removed.'}</p>
            <Link href="/returns" className={styles.actionBtn}>
              Back to All Returns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = (returnRecord.status || 'INITIATED').toUpperCase();
  const isRejected = status === 'REJECTED';
  const isRefunded = status === 'REFUNDED';
  const isPickedUp = status === 'PICKED_UP' || isRefunded;
  const isPickupScheduled = status === 'PICKUP_SCHEDULED' || isPickedUp;
  const isApproved = status === 'APPROVED' || isPickupScheduled;

  const formattedDate = new Date(returnRecord.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalCalculatedRefund = typeof returnRecord.refundAmount === 'number'
    ? returnRecord.refundAmount
    : returnRecord.items.reduce((sum, it) => sum + (it.orderItem?.price || 0) * (it.orderItem?.quantity || 1), 0);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/returns" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={14} /> Back to Returns
          </Link>
        </div>

        <header className={styles.pageHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.pageTitle}>Return #{returnRecord.id.slice(0, 8).toUpperCase()}</h1>
              <p className={styles.pageSubtitle}>
                For Order #{returnRecord.order?.orderNumber || returnRecord.orderId.slice(0, 8).toUpperCase()} • Requested on {formattedDate}
              </p>
            </div>
            <div>
              {isRefunded ? (
                <span className={`${styles.statusBadge} ${styles.statusCompleted}`} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
                  <CheckCircle2 size={16} /> Refund Completed
                </span>
              ) : isRejected ? (
                <span className={styles.statusBadge} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
                  <XCircle size={16} /> Request Declined
                </span>
              ) : isPickedUp ? (
                <span className={styles.statusBadge} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
                  <Package size={16} /> In Transit to Warehouse
                </span>
              ) : isPickupScheduled ? (
                <span className={styles.statusBadge} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                  <Truck size={16} /> Pickup Scheduled
                </span>
              ) : (
                <span className={`${styles.statusBadge} ${styles.statusProcessing}`} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
                  <Clock size={16} /> Return Under Review
                </span>
              )}
            </div>
          </div>
        </header>

        <div className={styles.detailGrid}>
          
          {/* Left Column: Timeline & Items */}
          <div>
            {/* Returned Items Card */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Returned Items ({returnRecord.items.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {returnRecord.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.25rem' }}>
                    <div className={styles.itemImageWrapper}>
                      {item.orderItem?.imageUrl ? (
                        <Image 
                          src={item.orderItem.imageUrl} 
                          alt={item.orderItem.productName || 'Item'} 
                          fill 
                          style={{ objectFit: 'contain', padding: '0.5rem' }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.itemDetails} style={{ flex: 1 }}>
                      <div className={styles.itemName}>{item.orderItem?.productName || 'Order Item'}</div>
                      {item.orderItem?.variantName && (
                        <div style={{ fontSize: '0.85rem', color: '#777' }}>Variant: {item.orderItem.variantName}</div>
                      )}
                      <div style={{ color: '#b77a25', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>
                        Reason: {formatReason(item.reason)}
                        {item.reasonOther ? ` (${item.reasonOther})` : ''}
                      </div>
                      {item.orderItem?.price && (
                        <div style={{ fontWeight: 600, marginTop: '0.35rem', color: '#111' }}>
                          ₹{(item.orderItem.price * (item.orderItem.quantity || 1)).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Status Tracker */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Return Status Tracker</h2>
              <div className={styles.timeline}>
                
                {/* Step 1 */}
                <div className={`${styles.timelineStep} ${styles.completed}`}>
                  <div className={styles.timelineDot}>✓</div>
                  <div className={styles.timelineTitle}>Return Requested</div>
                  <div className={styles.timelineDesc}>Your return request was submitted and logged into our system.</div>
                  <div className={styles.timelineDate}>{formattedDate}</div>
                </div>

                {/* Step 2 */}
                <div className={`${styles.timelineStep} ${isApproved ? styles.completed : status === 'INITIATED' ? styles.active : ''}`}>
                  <div className={styles.timelineDot}>{isApproved ? '✓' : ''}</div>
                  <div className={styles.timelineTitle}>Request Review & Approval</div>
                  <div className={styles.timelineDesc}>
                    {isApproved ? 'Return request has been verified and approved.' : 'Our team is reviewing the return eligibility.'}
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`${styles.timelineStep} ${isPickedUp ? styles.completed : isPickupScheduled ? styles.active : ''}`}>
                  <div className={styles.timelineDot}>{isPickedUp ? '✓' : ''}</div>
                  <div className={styles.timelineTitle}>Pickup & In-Transit</div>
                  <div className={styles.timelineDesc}>
                    {isPickedUp
                      ? 'Item picked up and in-transit to warehouse facility.'
                      : isPickupScheduled
                      ? 'Courier pickup scheduled from your delivery address.'
                      : 'Courier assignment pending approval.'}
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`${styles.timelineStep} ${isRefunded ? styles.completed : isPickedUp ? styles.active : ''}`}>
                  <div className={styles.timelineDot}>{isRefunded ? '✓' : ''}</div>
                  <div className={styles.timelineTitle}>Quality Check & Refund</div>
                  <div className={styles.timelineDesc}>
                    {isRefunded
                      ? 'Item verified at warehouse. Refund successfully processed!'
                      : 'Quality verification upon warehouse arrival, followed by refund initiation.'}
                  </div>
                  {isRefunded && (
                    <div className={styles.timelineDate} style={{ color: '#2e7d32', fontWeight: 600 }}>
                      Refund Processed
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Refund Summary */}
          <div>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Refund Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Items Subtotal</span>
                <span style={{ color: '#111', fontWeight: 600 }}>
                  ₹{totalCalculatedRefund.toLocaleString('en-IN')}
                </span>
              </div>

              <div className={styles.summaryRow} style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#111' }}>Total Refund Value</span>
                <span style={{ fontWeight: 700, color: '#2e7d32', fontSize: '1.2rem' }}>
                  ₹{totalCalculatedRefund.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className={styles.summaryRow} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#111' }}>Refund Destination</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fcfcfc', border: '1px solid #eee', padding: '1rem', borderRadius: '12px' }}>
                <CreditCard size={20} color="#666" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>Original Payment Method</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>Direct bank / UPI / Card reversal</div>
                </div>
              </div>

              {returnRecord.pickupInstructions && (
                <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} /> Pickup Instructions
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {returnRecord.pickupInstructions}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(231, 160, 59, 0.08)', borderRadius: '12px', fontSize: '0.85rem', color: '#b77a25', lineHeight: 1.5 }}>
                {isRefunded
                  ? "Refund has been initiated. Depending on your bank or payment provider, it may take 2-4 business days to appear on your statement."
                  : "Refunds are initiated immediately once the returned product passes the initial quality check upon courier arrival."}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
