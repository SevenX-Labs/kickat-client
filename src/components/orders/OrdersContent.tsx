"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import {
  Package, Search, ChevronDown, MapPin, Check, CheckCircle2,
  RefreshCw, FileText, ArrowLeft, Filter, X, Eye, RotateCcw,
  AlertCircle, Download, XCircle, Loader2
} from 'lucide-react';
import styles from '@/app/account/Account.module.css';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { orderService } from '@/services/orderService';

export interface OrdersContentProps {
  showBackToAccount?: boolean;
}

function formatOrderStatus(statusStr: string): string {
  const upper = (statusStr || '').toUpperCase();
  if (upper === 'DELIVERED') return 'Delivered';
  if (upper === 'CANCELLED') return 'Cancelled';
  if (upper.includes('RETURN')) return 'Returned';
  if (['SHIPPED', 'OUT_FOR_DELIVERY'].includes(upper)) return 'Shipped';
  if (['PLACED', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(upper)) return 'Processing';
  return statusStr ? statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase() : 'Processing';
}

function isCancellable(statusStr: string): boolean {
  const upper = (statusStr || '').toUpperCase();
  return ['PLACED', 'PENDING', 'CONFIRMED', 'PROCESSING'].includes(upper);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function OrdersContent({ showBackToAccount = true }: OrdersContentProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Action states
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cancel Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('changed_mind');
  const [cancelReasonOther, setCancelReasonOther] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedOrders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedOrders(next);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      if (res && Array.isArray(res.orders) && res.orders.length > 0) {
        const formatted = res.orders.map((o: any) => {
          const rawStatus = (o.orderStatus || o.status || 'PLACED').toUpperCase();
          const displayStatus = formatOrderStatus(rawStatus);
          return {
            id: o.orderNumber || o.id,
            rawId: o.id,
            rawStatus: rawStatus,
            date: formatDate(o.createdAt),
            status: displayStatus,
            total: o.grandTotal ?? o.totalAmount ?? o.subtotal ?? 0,
            paymentMethod: o.paymentMethod || 'Online',
            paymentStatus: o.paymentStatus || 'PENDING',
            items: (o.items || []).map((item: any) => ({
              id: item.id,
              productId: item.productId,
              productSlug: item.productSlug,
              name: item.productName || item.name || 'Pet Product',
              variant: item.variantName || item.variant || 'Standard',
              qty: item.quantity || item.qty || 1,
              price: item.price || 0,
              image: item.imageUrl || item.image || '/hero-products/dog_food.png',
            })),
            timeline: [
              { step: 'Placed', date: formatDate(o.createdAt), done: true },
              { step: 'Packed', date: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(rawStatus) ? formatDate(o.createdAt) : '', done: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(rawStatus) },
              { step: 'Shipped', date: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(rawStatus) ? formatDate(o.createdAt) : '', done: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(rawStatus) },
              { step: 'Delivered', date: rawStatus === 'DELIVERED' ? formatDate(o.updatedAt || o.createdAt) : '', done: rawStatus === 'DELIVERED' },
            ],
          };
        });
        setOrders(formatted);
        if (formatted.length > 0 && formatted[0]?.id) {
          setExpandedOrders(new Set([formatted[0].id]));
        }
      } else {
        setOrders([]);
        setExpandedOrders(new Set());
      }
    } catch (err) {
      console.error('Failed to fetch orders from server:', err);
      setOrders([]);
      setExpandedOrders(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handleReorderClick = async (orderId: string, rawId?: string) => {
    const targetId = rawId || orderId;
    setReorderingId(targetId);
    try {
      const res = await orderService.reorder(targetId);
      if (res && res.success) {
        showToast('Items added to your cart successfully!', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-item-added'));
        }
      } else {
        showToast('Items added to cart!', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-item-added'));
        }
      }
    } catch (err: any) {
      console.error('Reorder failed:', err);
      showToast(err?.message || 'Failed to reorder items. Please try again.', 'error');
    } finally {
      setReorderingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      const res = await orderService.cancelOrder(
        cancelModalOrder.rawId,
        cancelReason,
        cancelReason === 'other' ? cancelReasonOther : undefined
      );
      if (res && res.success) {
        showToast(`Order #${cancelModalOrder.id} has been cancelled.`, 'success');
        setCancelModalOrder(null);
        setCancelReason('changed_mind');
        setCancelReasonOther('');
        await fetchUserOrders();
      } else {
        showToast(res?.message || 'Failed to cancel order.', 'error');
      }
    } catch (err: any) {
      console.error('Cancel order failed:', err);
      showToast(err?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10000,
            background: toastMessage.type === 'success' ? '#15803D' : '#DC2626',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {showBackToAccount && (
        <div className={styles.backHeaderGroup}>
          <Link href="/account" className={styles.backToAccountBtn}>
            <ArrowLeft size={18} />
            <span>Back to Account</span>
          </Link>
        </div>
      )}

      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageH1}>My Orders</h1>
            <p className={styles.pageSubtitle}>Track, manage and review your purchases</p>
          </div>
          {!loading && orders.length > 0 && (
            <div style={{
              background: '#FFF4E6',
              color: '#F28C0F',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: '1px solid rgba(242, 140, 15, 0.2)'
            }}>
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </div>
          )}
        </div>

        {/* Search Row + Filter Icon Button */}
        <div className={styles.ordersToolbarRow}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: '#EBE5DB',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4A453E',
                  marginLeft: '8px'
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            className={`${styles.filterTriggerBtn} ${statusFilter !== 'All' ? styles.filterActive : ''}`}
            onClick={() => setIsFilterSheetOpen(true)}
            aria-label="Filter Orders"
            title="Filter Orders"
          >
            <Filter size={18} />
            {statusFilter !== 'All' && <span className={styles.filterActiveDot} />}
          </button>
        </div>

        {/* Quick Filter Chips for Desktop/Tablet */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '1.25rem',
          scrollbarWidth: 'none',
        }}>
          {statuses.map((s) => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid #F28C0F' : '1px solid #EFE7DA',
                  background: isActive ? '#F28C0F' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B6157',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {s === 'All' ? 'All Orders' : s}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className={styles.ordersList}>
            <Skeleton className={styles.orderCardSkeleton} style={{ height: 260, borderRadius: '16px' }} />
            <Skeleton className={styles.orderCardSkeleton} style={{ height: 260, borderRadius: '16px' }} />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const cancellable = isCancellable(order.rawStatus);
              const isDelivered = order.status === 'Delivered';
              const isOngoing = ['Processing', 'Shipped'].includes(order.status);

              return (
                <div key={order.id} className={styles.orderCard}>
                  {/* Card Header Row */}
                  <div className={styles.orderCardHeaderRow}>
                    <div className={styles.orderMetaCol}>
                      <Link
                        href={`/orders/${order.rawId || order.id}`}
                        className={styles.orderIdBadge}
                        style={{ textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="View Order Details"
                      >
                        <span>{order.id}</span>
                        <Eye size={13} color="#F28C0F" />
                      </Link>
                      <span className={styles.orderDate}>{order.date}</span>
                    </div>
                    <Badge variant={order.status.toLowerCase() as any}>{order.status}</Badge>
                  </div>

                  {/* Expandable Timeline Dropdown */}
                  <div className={styles.orderTimelineWrap}>
                    <button type="button" className={styles.timelineToggle} onClick={() => toggleExpanded(order.id)}>
                      <CheckCircle2 size={16} color="var(--acc-success, #16A34A)" />
                      <span>{order.status} on {order.date}</span>
                      <ChevronDown
                        size={16}
                        className={`${styles.timelineChevron} ${expandedOrders.has(order.id) ? styles.timelineChevronOpen : ''}`}
                      />
                    </button>
                    {expandedOrders.has(order.id) && (
                      <div className={styles.orderTimeline}>
                        {order.timeline.map((t: any, idx: number) => (
                          <div key={t.step} className={`${styles.timelineStep} ${t.done ? styles.done : ''}`}>
                            <div className={styles.timelineDot}>
                              {t.done ? <Check size={12} strokeWidth={3} /> : <div className={styles.innerDot} />}
                            </div>
                            <div className={styles.timelineTextCol}>
                              <span className={styles.stepTitle}>{t.step}</span>
                              <span className={styles.stepDate}>{t.date}</span>
                            </div>
                            {idx < order.timeline.length - 1 && <div className={styles.timelineLine} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Items Preview with Actual Image */}
                  <div className={styles.orderItemsPreview}>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className={styles.itemRow}>
                        <div className={styles.itemThumbWrap} style={{ background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                          <SafeImage
                            src={item.image}
                            productName={item.name}
                            alt={item.name}
                            width={64}
                            height={64}
                            className={styles.itemThumb}
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <div className={styles.itemDetails}>
                          <Link
                            href={item.productSlug ? `/product/${item.productSlug}${item.variantId ? `?variant=${item.variantId}` : ''}` : item.productId ? `/product/${item.productId}${item.variantId ? `?variant=${item.variantId}` : ''}` : `/orders/${order.rawId || order.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <span className={styles.itemName} style={{ cursor: 'pointer' }}>{item.name}</span>
                          </Link>
                          <span className={styles.itemVariant}>
                            {item.variant} • Qty: {item.qty}
                          </span>
                        </div>
                        <span className={styles.itemPrice}>
                          ₹{Number(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer: Amount & Action Buttons */}
                  <div className={styles.orderCardFooterRow}>
                    <div className={styles.orderTotalCol}>
                      <span className={styles.totalLabel}>Total Amount</span>
                      <span className={styles.totalValue}>
                        ₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className={styles.orderActions}>
                      {/* View Details Button */}
                      <Link href={`/orders/${order.rawId || order.id}`}>
                        <Button variant="secondary" size="sm" icon={<Eye size={15} />}>
                          Details
                        </Button>
                      </Link>

                      {/* Invoice Button */}
                      <Link href={`/orders/${order.rawId || order.id}/invoice`}>
                        <Button variant="secondary" size="sm" icon={<FileText size={15} />}>
                          Invoice
                        </Button>
                      </Link>

                      {/* Track Button (for ongoing / active orders) */}
                      {isOngoing && (
                        <Link href={`/orders/${order.rawId || order.id}`}>
                          <Button variant="primary" size="sm" icon={<MapPin size={15} />}>
                            Track
                          </Button>
                        </Link>
                      )}

                      {/* Return Button (for delivered orders) */}
                      {isDelivered && (
                        <Link href={`/orders/${order.rawId || order.id}/return`}>
                          <Button variant="secondary" size="sm" icon={<RotateCcw size={15} />}>
                            Return
                          </Button>
                        </Link>
                      )}

                      {/* Cancel Button (for placed / processing orders) */}
                      {cancellable && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<XCircle size={15} color="#DC2626" />}
                          onClick={() => setCancelModalOrder(order)}
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          Cancel
                        </Button>
                      )}

                      {/* Reorder Button */}
                      {(isDelivered || order.status === 'Cancelled' || order.status === 'Returned') && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={reorderingId === (order.rawId || order.id) ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                          disabled={reorderingId === (order.rawId || order.id)}
                          onClick={() => handleReorderClick(order.id, order.rawId)}
                        >
                          {reorderingId === (order.rawId || order.id) ? 'Adding...' : 'Reorder'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Package size={48} />}
            title="No orders found"
            description="You haven't placed any orders that match your search or filters."
            action={
              <Link href="/shop">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            }
          />
        )}
      </div>

      {/* Slide-Up Filter Bottom Sheet Modal */}
      {isFilterSheetOpen && (
        <div className={styles.filterSheetBackdrop} onClick={() => setIsFilterSheetOpen(false)}>
          <div className={styles.filterSheetCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />

            <div className={styles.sheetHeader}>
              <h2 className={styles.sheetTitle}>Filter Orders</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {statusFilter !== 'All' && (
                  <button
                    type="button"
                    className={styles.resetFilterBtn}
                    onClick={() => setStatusFilter('All')}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                  aria-label="Close Filter"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.sheetOptionsList}>
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.sheetOptionRow} ${statusFilter === s ? styles.sheetOptionSelected : ''}`}
                  onClick={() => {
                    setStatusFilter(s);
                    setIsFilterSheetOpen(false);
                  }}
                >
                  <span>{s === 'All' ? 'All Orders' : s}</span>
                  {statusFilter === s && <Check size={18} color="#F28C0F" strokeWidth={2.5} />}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.sheetApplyBtn}
              onClick={() => setIsFilterSheetOpen(false)}
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(26, 22, 18, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setCancelModalOrder(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1A1612' }}>
                    Cancel Order #{cancelModalOrder.id}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#78746D', margin: 0 }}>
                    Are you sure you want to cancel this order?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                style={{
                  background: '#F5F2EC',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                Please select a reason:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D6D1C7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FAF7F2',
                }}
              >
                <option value="changed_mind">Changed my mind</option>
                <option value="ordered_by_mistake">Ordered by mistake</option>
                <option value="found_cheaper">Found cheaper elsewhere</option>
                <option value="other">Other reason</option>
              </select>

              {cancelReason === 'other' && (
                <textarea
                  placeholder="Please specify your reason..."
                  value={cancelReasonOther}
                  onChange={(e) => setCancelReasonOther(e.target.value)}
                  maxLength={200}
                  style={{
                    marginTop: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D6D1C7',
                    fontSize: '0.85rem',
                    outline: 'none',
                    minHeight: '70px',
                    resize: 'none',
                  }}
                />
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '8px',
            }}>
              <Button
                variant="secondary"
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Cancelling...
                  </>
                ) : (
                  'Confirm Cancel'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
