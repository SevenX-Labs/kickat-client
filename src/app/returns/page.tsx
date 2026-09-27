"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Package, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import styles from './Returns.module.css';
import { returnsService } from '@/services/returnsService';
import { ReturnRecord } from '@/types/returns';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Initiated', value: 'INITIATED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pickup Scheduled', value: 'PICKUP_SCHEDULED' },
  { label: 'Picked Up', value: 'PICKED_UP' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Rejected', value: 'REJECTED' },
];

function getStatusBadge(status: string) {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'REFUNDED':
      return (
        <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
          <CheckCircle2 size={14} /> Refund Completed
        </span>
      );
    case 'REJECTED':
      return (
        <span className={styles.statusBadge} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
          <XCircle size={14} /> Request Rejected
        </span>
      );
    case 'PICKUP_SCHEDULED':
      return (
        <span className={styles.statusBadge} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
          <Truck size={14} /> Pickup Scheduled
        </span>
      );
    case 'PICKED_UP':
      return (
        <span className={styles.statusBadge} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
          <Package size={14} /> Picked Up
        </span>
      );
    case 'APPROVED':
      return (
        <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>
          <ShieldCheck size={14} /> Approved
        </span>
      );
    case 'INITIATED':
    case 'PENDING':
    default:
      return (
        <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>
          <Clock size={14} /> Under Review
        </span>
      );
  }
}

function formatReason(reason: string) {
  const map: Record<string, string> = {
    wrong_item: 'Wrong item delivered',
    damaged: 'Damaged / defective',
    expired: 'Expired product',
    not_as_described: 'Not as described',
    other: 'Other issue',
  };
  return map[reason.toLowerCase()] || reason;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await returnsService.getReturns({
        page,
        limit: 10,
        status: activeTab !== 'ALL' ? activeTab : undefined,
      });
      if (response && response.success) {
        setReturns(response.returns || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      } else {
        setReturns([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch returns:', err);
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        setError('Please sign in to view your return requests.');
      } else {
        setError(err?.message || 'Failed to load return requests.');
      }
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/orders">Orders</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>Returns & Refunds</span>
        </div>

        <header className={styles.pageHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.pageTitle}>Returns & Refunds</h1>
              <p className={styles.pageSubtitle}>
                Track live return status, pickup logistics, and refund transfers.
              </p>
            </div>
            <Link 
              href="/orders" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: '#111',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <Package size={16} /> View Orders to Return
            </Link>
          </div>
        </header>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setActiveTab(filter.value);
                setPage(1);
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: activeTab === filter.value ? '1.5px solid #E7A03B' : '1px solid #eaeaea',
                background: activeTab === filter.value ? '#E7A03B' : 'white',
                color: activeTab === filter.value ? '#111' : '#555',
                fontWeight: activeTab === filter.value ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem', flex: 1 }}>{error}</span>
            {error.includes('sign in') && (
              <Link href="/login" style={{ color: '#b91c1c', fontWeight: 600, textDecoration: 'underline', fontSize: '0.85rem' }}>
                Sign In
              </Link>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #eaeaea', minHeight: '110px' }} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && returns.length === 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Package size={32} color="#E7A03B" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
              No Return Requests Found
            </h3>
            <p style={{ color: '#666', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              {activeTab === 'ALL'
                ? "You haven't requested any returns yet. Delivered items eligible within 7 days can be returned from your Orders page."
                : `No returns found matching status "${activeTab}".`}
            </p>
            <Link
              href="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.75rem',
                background: '#111',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <ShoppingBag size={16} /> Go to My Orders
            </Link>
          </div>
        )}

        {/* Returns List */}
        {!loading && returns.length > 0 && (
          <div>
            {returns.map((ret) => {
              const firstItem = ret.items?.[0];
              const itemCount = ret.items?.length || 1;
              const formattedDate = new Date(ret.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={ret.id} className={styles.returnCard}>
                  <div className={styles.returnInfo}>
                    <div className={styles.itemImageWrapper}>
                      {firstItem?.orderItem?.imageUrl ? (
                        <Image
                          src={firstItem.orderItem.imageUrl}
                          alt={firstItem.orderItem.productName || 'Returned Product'}
                          fill
                          style={{ objectFit: 'contain', padding: '0.5rem' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <div className={styles.itemDetails}>
                      <div className={styles.itemName}>
                        {firstItem?.orderItem?.productName || 'Return Items'}
                        {itemCount > 1 && (
                          <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 500, marginLeft: '0.5rem' }}>
                            (+{itemCount - 1} more {itemCount - 1 === 1 ? 'item' : 'items'})
                          </span>
                        )}
                      </div>
                      <div className={styles.returnId}>
                        Return #{ret.id.slice(0, 8).toUpperCase()} • Order #{ret.order?.orderNumber || ret.orderId.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Requested on {formattedDate} • Reason: {firstItem ? formatReason(firstItem.reason) : 'Return'}
                      </div>
                      <div style={{ marginTop: '0.4rem' }}>
                        {getStatusBadge(ret.status)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Refund Amount</div>
                      <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#111' }}>
                        {typeof ret.refundAmount === 'number'
                          ? `₹${ret.refundAmount.toLocaleString('en-IN')}`
                          : typeof ret.order?.grandTotal === 'number'
                          ? `₹${ret.order.grandTotal.toLocaleString('en-IN')}`
                          : 'Pending calculation'}
                      </div>
                    </div>
                    <Link href={`/returns/${ret.id}`} className={styles.actionBtn}>
                      View Status <ChevronRight size={14} style={{ display: 'inline', marginLeft: '0.2rem' }} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #eaeaea',
                background: page <= 1 ? '#f5f5f5' : 'white',
                color: page <= 1 ? '#aaa' : '#111',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.9rem', color: '#666' }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #eaeaea',
                background: page >= totalPages ? '#f5f5f5' : 'white',
                color: page >= totalPages ? '#aaa' : '#111',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
