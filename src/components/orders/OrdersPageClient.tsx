"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import {
  Package, Search, ChevronDown, Check, Copy, Clock, Truck,
  CheckCircle2, XCircle, RotateCcw, MapPin, FileText, Eye, Filter,
  RefreshCw, Star, AlertCircle, Loader2, X, Calendar, SearchX,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import styles from './OrdersPage.module.css';

export interface OrdersPageClientProps {
  showBackToAccount?: boolean;
}

/* ----------------------------- helpers ----------------------------- */

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

function formatPrice(n: number): string {
  return `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortenId(id: string): string {
  if (!id) return '';
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

type Tone = 'amber' | 'blue' | 'green' | 'red' | 'grey';

function statusTone(status: string): Tone {
  switch (status) {
    case 'Processing': return 'amber';
    case 'Shipped': return 'blue';
    case 'Delivered': return 'green';
    case 'Cancelled': return 'red';
    default: return 'grey'; // Returned / Refunded
  }
}

function StatusIcon({ status, size = 14 }: { status: string; size?: number }) {
  switch (status) {
    case 'Processing': return <Clock size={size} />;
    case 'Shipped': return <Truck size={size} />;
    case 'Delivered': return <CheckCircle2 size={size} />;
    case 'Cancelled': return <XCircle size={size} />;
    default: return <RotateCcw size={size} />;
  }
}

const toneBadge: Record<Tone, string> = {
  amber: styles.badgeAmber, blue: styles.badgeBlue, green: styles.badgeGreen,
  red: styles.badgeRed, grey: styles.badgeGrey,
};
const toneSummary: Record<Tone, string> = {
  amber: styles.summaryAmber, blue: styles.summaryBlue, green: styles.summaryGreen,
  red: styles.summaryRed, grey: styles.summaryGrey,
};

const PAGE_SIZE = 6;
const CURRENT_YEAR = new Date().getFullYear();

const DATE_RANGES = [
  { key: 'all', label: 'All time' },
  { key: '30d', label: 'Last 30 days' },
  { key: '6m', label: 'Last 6 months' },
  { key: 'year', label: String(CURRENT_YEAR) },
];

/* ----------------------------- component ----------------------------- */

export default function OrdersPageClient({ showBackToAccount = false }: OrdersPageClientProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');
  const [dateRange, setDateRange] = useState('all');
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [stuck, setStuck] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('changed_mind');
  const [cancelReasonOther, setCancelReasonOther] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const dateWrapRef = useRef<HTMLDivElement | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const fetchUserOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await orderService.getOrders();
      if (res && Array.isArray(res.orders)) {
        const formatted = res.orders.map((o: any) => {
          const rawStatus = (o.orderStatus || o.status || 'PLACED').toUpperCase();
          const displayStatus = formatOrderStatus(rawStatus);
          const subtotal = o.subtotal ?? (o.items || []).reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || it.qty || 1), 0);
          const delivery = o.deliveryFee ?? 0;
          const taxes = (o.gstAmount ?? 0) + (o.codFee ?? 0) + (o.extraFeeAmount ?? 0);
          const discount = o.discountAmount ?? 0;
          const total = o.grandTotal ?? o.totalAmount ?? subtotal;
          return {
            id: o.orderNumber || o.id,
            rawId: o.id,
            rawStatus,
            status: displayStatus,
            date: formatDate(o.createdAt),
            createdAtRaw: o.createdAt,
            total,
            subtotal,
            delivery,
            taxes,
            discount,
            paymentMethod: o.paymentMethod || 'Online',
            paymentStatus: (o.paymentStatus || '').toUpperCase(),
            estimatedDelivery: o.estimatedDelivery || o.deliveryDate || '',
            deliveredDate: formatDate(o.deliveryDate || o.updatedAt || o.createdAt),
            cancelledAt: formatDate(o.cancelledAt || o.updatedAt),
            cancelReason: o.cancelReason || '',
            cancelReasonOther: o.cancelReasonOther || '',
            items: (o.items || []).map((item: any) => ({
              id: item.id,
              productId: item.productId,
              productSlug: item.productSlug,
              variantId: item.variantId,
              name: item.productName || item.name || 'Pet Product',
              variant: item.variantName || item.variant || 'Standard',
              qty: item.quantity || item.qty || 1,
              price: item.price || 0,
              image: item.imageUrl || item.image || '/hero-products/dog_food.png',
              brand: item.brand,
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
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders from server:', err);
      setError(true);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUserOrders(); }, [fetchUserOrders]);

  // Sticky toolbar shadow
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  // Close date menu on outside click
  useEffect(() => {
    if (!dateMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (dateWrapRef.current && !dateWrapRef.current.contains(e.target as Node)) setDateMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dateMenuOpen]);

  // Reset pagination whenever a filter changes (kept out of an effect to avoid cascading renders)
  const changeSearch = (v: string) => { setSearchQuery(v); setVisibleCount(PAGE_SIZE); };
  const changeStatus = (v: 'All' | 'Active' | 'Delivered' | 'Cancelled') => { setStatusFilter(v); setVisibleCount(PAGE_SIZE); };
  const changeDateRange = (v: string) => { setDateRange(v); setVisibleCount(PAGE_SIZE); };

  const handleReorderClick = async (orderId: string, rawId?: string) => {
    const targetId = rawId || orderId;
    setReorderingId(targetId);
    try {
      const res = await orderService.reorder(targetId);
      showToast(res?.message || 'Items added to your cart successfully!', 'success');
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart-item-added'));
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

  /* ---------------- derived data ---------------- */

  const inDateRange = (createdAtRaw?: string): boolean => {
    if (dateRange === 'all' || !createdAtRaw) return true;
    const d = new Date(createdAtRaw);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    if (dateRange === '30d') return d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (dateRange === '6m') { const c = new Date(now); c.setMonth(c.getMonth() - 6); return d >= c; }
    if (dateRange === 'year') return d.getFullYear() === CURRENT_YEAR;
    return true;
  };

  const matchesTab = (o: any, tab: string): boolean => {
    if (tab === 'All') return true;
    if (tab === 'Active') return o.status === 'Processing' || o.status === 'Shipped';
    if (tab === 'Delivered') return o.status === 'Delivered';
    if (tab === 'Cancelled') return o.status === 'Cancelled';
    return true;
  };

  const dateScoped = orders.filter((o) => inDateRange(o.createdAtRaw));

  const counts = {
    All: dateScoped.length,
    Active: dateScoped.filter((o) => matchesTab(o, 'Active')).length,
    Delivered: dateScoped.filter((o) => matchesTab(o, 'Delivered')).length,
    Cancelled: dateScoped.filter((o) => matchesTab(o, 'Cancelled')).length,
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredOrders = dateScoped.filter((o) => {
    const matchesStatus = matchesTab(o, statusFilter);
    const matchesSearch =
      !q ||
      String(o.id).toLowerCase().includes(q) ||
      o.items.some((i: any) => i.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const hasMore = filteredOrders.length > visibleCount;

  const tabs: Array<'All' | 'Active' | 'Delivered' | 'Cancelled'> = ['All', 'Active', 'Delivered', 'Cancelled'];
  const clearFilters = () => { setStatusFilter('All'); setSearchQuery(''); setDateRange('all'); setVisibleCount(PAGE_SIZE); };

  /* ---------------- render ---------------- */

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {showBackToAccount && (
          <div className={styles.backRow}>
            <Link href="/account" className={styles.backLink}>
              <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
              <span>Back to Account</span>
            </Link>
          </div>
        )}

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>
              {loading
                ? 'Loading your purchases…'
                : orders.length === 0
                  ? 'Track, manage and review your purchases'
                  : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} placed with KickAt`}
            </p>
          </div>
          <div className={styles.searchFilterRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by order ID or product…"
                value={searchQuery}
                onChange={(e) => changeSearch(e.target.value)}
                aria-label="Search orders by order ID or product name"
              />
              {searchQuery && (
                <button type="button" className={styles.searchClear} onClick={() => changeSearch('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              className={`${styles.mobileFilterBtn} ${(statusFilter !== 'All' || dateRange !== 'all') ? styles.mobileFilterBtnActive : ''}`}
              onClick={() => setFilterSheetOpen(true)}
              aria-label="Filter orders"
              title="Filter Orders"
            >
              <Filter size={18} />
              {(statusFilter !== 'All' || dateRange !== 'all') && <span className={styles.filterBadgeDot} />}
            </button>
          </div>
        </header>

        {/* sentinel for sticky detection */}
        <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

        {/* Mobile active filter pills */}
        {(statusFilter !== 'All' || dateRange !== 'all') && (
          <div className={styles.mobileActiveFilters}>
            <span className={styles.mobileActiveLabel}>Filters:</span>
            {statusFilter !== 'All' && (
              <span className={styles.mobileFilterChip}>
                {statusFilter}
                <button type="button" onClick={() => changeStatus('All')} aria-label="Clear status filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {dateRange !== 'all' && (
              <span className={styles.mobileFilterChip}>
                {DATE_RANGES.find((d) => d.key === dateRange)?.label}
                <button type="button" onClick={() => changeDateRange('all')} aria-label="Clear date filter">
                  <X size={12} />
                </button>
              </span>
            )}
            <button type="button" className={styles.mobileClearBtn} onClick={clearFilters}>
              Reset all
            </button>
          </div>
        )}

        {/* Sticky toolbar: filter tabs + date range (Desktop/Tablet) */}
        <div className={`${styles.toolbar} ${stuck ? styles.toolbarStuck : ''}`}>
          <div className={styles.tabs} role="tablist" aria-label="Filter orders by status">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={statusFilter === t}
                className={`${styles.tab} ${statusFilter === t ? styles.tabActive : ''}`}
                onClick={() => changeStatus(t)}
              >
                <span>{t}</span>
                <span className={styles.tabCount}>{counts[t]}</span>
              </button>
            ))}
          </div>

          <div className={styles.dateWrap} ref={dateWrapRef}>
            <button
              type="button"
              className={styles.dateBtn}
              onClick={() => setDateMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={dateMenuOpen}
            >
              <Calendar size={15} />
              <span>{DATE_RANGES.find((d) => d.key === dateRange)?.label}</span>
              <ChevronDown size={15} className={`${styles.dateChevron} ${dateMenuOpen ? styles.dateChevronOpen : ''}`} />
            </button>
            {dateMenuOpen && (
              <div className={styles.dateMenu} role="listbox">
                {DATE_RANGES.map((d) => (
                  <button
                    key={d.key}
                    role="option"
                    aria-selected={dateRange === d.key}
                    className={`${styles.dateOption} ${dateRange === d.key ? styles.dateOptionActive : ''}`}
                    onClick={() => { changeDateRange(d.key); setDateMenuOpen(false); }}
                  >
                    <span>{d.label}</span>
                    {dateRange === d.key && <Check size={15} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.list}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skelCard}>
                <div className={styles.skelRow}>
                  <div className={styles.skel} style={{ width: 90, height: 24, borderRadius: 9999 }} />
                  <div className={styles.skel} style={{ width: 120, height: 14, marginLeft: 'auto' }} />
                </div>
                <div className={styles.skelRow}>
                  <div className={styles.skel} style={{ width: 64, height: 64, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className={styles.skel} style={{ width: '60%', height: 16, marginBottom: 8 }} />
                    <div className={styles.skel} style={{ width: '35%', height: 13 }} />
                  </div>
                </div>
                <div className={styles.skelRow}>
                  <div className={styles.skel} style={{ width: 200, height: 14 }} />
                  <div className={styles.skel} style={{ width: 160, height: 36, borderRadius: 10, marginLeft: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.state}>
            <div className={`${styles.stateIcon} ${styles.stateIconDanger}`}><AlertCircle size={40} /></div>
            <h3 className={styles.stateTitle}>Couldn’t load your orders</h3>
            <p className={styles.stateDesc}>Something went wrong while fetching your orders. Please try again.</p>
            <button type="button" className={styles.loadMoreBtn} onClick={fetchUserOrders}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.state}>
            <div className={styles.stateIcon}><Package size={40} /></div>
            <h3 className={styles.stateTitle}>No orders yet</h3>
            <p className={styles.stateDesc}>When you place an order, it’ll show up here so you can track and manage it.</p>
            <Link href="/shop" className={`${styles.btn} ${styles.btnPrimary}`} style={{ height: 44, padding: '0 22px' }}>
              Start Shopping
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.state}>
            <div className={`${styles.stateIcon} ${styles.stateIconMuted}`}><SearchX size={40} /></div>
            <h3 className={styles.stateTitle}>
              {statusFilter === 'Cancelled' ? 'No cancelled orders'
                : statusFilter === 'Delivered' ? 'No delivered orders'
                : statusFilter === 'Active' ? 'No active orders'
                : 'No matching orders'}
            </h3>
            <p className={styles.stateDesc}>No orders match your current filters or search.</p>
            <button type="button" className={styles.clearFilterLink} onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {visibleOrders.map((order) => {
                const tone = statusTone(order.status);
                const expanded = expandedOrders.has(order.id);
                const cancellable = isCancellable(order.rawStatus);
                const isDelivered = order.status === 'Delivered';
                const isCancelled = order.status === 'Cancelled';
                const isReturned = order.status === 'Returned';
                const isActive = order.status === 'Processing' || order.status === 'Shipped';

                const doneCount = order.timeline.filter((t: any) => t.done).length;
                const extraItems = order.items.length - 2;

                // Footer one-line status summary
                let summaryText = '';
                if (isActive) {
                  summaryText = order.estimatedDelivery
                    ? `Arriving by ${formatDate(order.estimatedDelivery)}`
                    : order.status === 'Shipped' ? 'On its way to you' : 'Order confirmed — preparing your items';
                } else if (isDelivered) {
                  summaryText = `Delivered on ${order.deliveredDate}`;
                } else if (isCancelled) {
                  const refunded = ['REFUNDED', 'REFUND_INITIATED', 'PAID'].includes(order.paymentStatus);
                  summaryText = `Cancelled on ${order.cancelledAt}${refunded ? ', refund processed' : ''}`;
                } else if (isReturned) {
                  summaryText = 'Return completed';
                }

                return (
                  <div key={order.id} className={styles.card}>
                    {/* Header */}
                    <div className={styles.cardHead}>
                      <div className={styles.headLeft}>
                        <span className={`${styles.badge} ${toneBadge[tone]}`}>
                          <StatusIcon status={order.status} />
                          {order.status}
                        </span>
                        <span className={styles.metaDot} />
                        <span className={styles.headDate}>{order.date}</span>
                        <span className={styles.metaDot} />
                        <span className={styles.orderId}>
                          <span className={styles.orderIdLabel}>#</span>
                          {shortenId(String(order.id))}
                          <button
                            type="button"
                            className={`${styles.copyBtn} ${copiedId === String(order.id) ? styles.copied : ''}`}
                            onClick={() => copyId(String(order.id))}
                            aria-label={`Copy order ID ${order.id}`}
                            title="Copy order ID"
                          >
                            {copiedId === String(order.id) ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </span>
                      </div>
                      <div className={styles.headRight}>
                        <div className={styles.headTotal}>
                          <span className={styles.headTotalLabel}>Total</span>
                          <span className={styles.headTotalValue}>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className={styles.cardBody}>
                      <div className={styles.thumbStack}>
                        {order.items.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className={styles.thumb}>
                            <SafeImage
                              src={item.image}
                              productName={item.name}
                              alt={item.name}
                              width={64}
                              height={64}
                              className={styles.thumbImg}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        ))}
                        {extraItems > 0 && <span className={styles.moreChip}>+{extraItems} more</span>}
                      </div>
                      <div className={styles.bodyInfo}>
                        <Link
                          href={order.items[0]?.productSlug
                            ? `/product/${order.items[0].productSlug}${order.items[0].variantId ? `?variant=${order.items[0].variantId}` : ''}`
                            : order.items[0]?.productId
                              ? `/product/${order.items[0].productId}`
                              : `/orders/${order.rawId || order.id}`}
                          className={styles.itemName}
                        >
                          {order.items[0]?.name || 'Order items'}
                        </Link>
                        <div className={styles.itemMeta}>
                          {order.items.length === 1
                            ? `${order.items[0]?.variant} • Qty ${order.items[0]?.qty}`
                            : `${order.items[0]?.variant} • Qty ${order.items[0]?.qty} · +${order.items.length - 1} other item${order.items.length - 1 > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      <div className={styles.bodyPrice}>
                        {formatPrice((order.items[0]?.price || 0) * (order.items[0]?.qty || 1))}
                        <small>item price</small>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.cardFoot}>
                      <span className={`${styles.summary} ${toneSummary[tone]}`}>
                        <StatusIcon status={order.status} size={16} />
                        <span>{summaryText}</span>
                      </span>
                      <div className={styles.actions}>
                        {/* Active: Track (primary) · Details · Invoice */}
                        {isActive && (
                          <>
                            <Link href={`/orders/${order.rawId || order.id}/tracking`} className={`${styles.btn} ${styles.btnPrimary}`}>
                              <MapPin size={15} /> Track Order
                            </Link>
                            <Link href={`/orders/${order.rawId || order.id}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                              <Eye size={15} /> Details
                            </Link>
                            <Link href={`/orders/${order.rawId || order.id}/invoice`} className={`${styles.btn} ${styles.btnTertiary}`}>
                              <FileText size={15} /> Invoice
                            </Link>
                            {cancellable && (
                              <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setCancelModalOrder(order)}>
                                <XCircle size={15} /> Cancel
                              </button>
                            )}
                          </>
                        )}

                        {/* Delivered: Reorder (primary) · Details · Invoice · Rate */}
                        {isDelivered && (
                          <>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnPrimary}`}
                              disabled={reorderingId === (order.rawId || order.id)}
                              onClick={() => handleReorderClick(order.id, order.rawId)}
                            >
                              {reorderingId === (order.rawId || order.id)
                                ? <><Loader2 size={15} className="animate-spin" /> Adding…</>
                                : <><RefreshCw size={15} /> Reorder</>}
                            </button>
                            <Link href={`/orders/${order.rawId || order.id}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                              <Eye size={15} /> Details
                            </Link>
                            <Link href={`/orders/${order.rawId || order.id}/invoice`} className={`${styles.btn} ${styles.btnTertiary}`}>
                              <FileText size={15} /> Invoice
                            </Link>
                            {order.items[0]?.productSlug && (
                              <Link href={`/product/${order.items[0].productSlug}#reviews`} className={styles.rateLink}>
                                <Star size={14} /> Rate product
                              </Link>
                            )}
                          </>
                        )}

                        {/* Cancelled: Reorder (outlined) · Details */}
                        {isCancelled && (
                          <>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              disabled={reorderingId === (order.rawId || order.id)}
                              onClick={() => handleReorderClick(order.id, order.rawId)}
                            >
                              {reorderingId === (order.rawId || order.id)
                                ? <><Loader2 size={15} className="animate-spin" /> Adding…</>
                                : <><RefreshCw size={15} /> Reorder</>}
                            </button>
                            <Link href={`/orders/${order.rawId || order.id}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                              <Eye size={15} /> Details
                            </Link>
                          </>
                        )}

                        {/* Returned / other */}
                        {isReturned && (
                          <>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnSecondary}`}
                              disabled={reorderingId === (order.rawId || order.id)}
                              onClick={() => handleReorderClick(order.id, order.rawId)}
                            >
                              {reorderingId === (order.rawId || order.id)
                                ? <><Loader2 size={15} className="animate-spin" /> Adding…</>
                                : <><RefreshCw size={15} /> Reorder</>}
                            </button>
                            <Link href={`/orders/${order.rawId || order.id}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                              <Eye size={15} /> Details
                            </Link>
                          </>
                        )}

                        <button
                          type="button"
                          className={styles.expandBtn}
                          onClick={() => toggleExpanded(order.id)}
                          aria-expanded={expanded}
                          aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
                        >
                          {expanded ? 'Less' : 'More'}
                          <ChevronDown size={15} className={`${styles.expandChevron} ${expanded ? styles.expandChevronOpen : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded */}
                    <div className={`${styles.expandWrap} ${expanded ? styles.expandWrapOpen : ''}`}>
                      <div className={styles.expandInner}>
                        <div className={styles.expandContent}>
                          <div className={styles.expandMain}>
                            {isCancelled ? (
                              <>
                                <h4 className={styles.expandHeading}>Order timeline</h4>
                                <div className={styles.cancelTimeline}>
                                  <div className={styles.ctRow}>
                                    <div className={`${styles.ctDot} ${styles.ctDotNeutral}`}><Check size={13} strokeWidth={3} /></div>
                                    <div className={styles.ctLine} />
                                    <div className={styles.ctText}>
                                      <span className={styles.ctTitle}>Placed</span>
                                      <span className={styles.ctDate}>{order.date}</span>
                                    </div>
                                  </div>
                                  <div className={styles.ctRow}>
                                    <div className={`${styles.ctDot} ${styles.ctDotRed}`}><X size={13} strokeWidth={3} /></div>
                                    <div className={styles.ctText}>
                                      <span className={`${styles.ctTitle} ${styles.ctTitleRed}`}>Cancelled</span>
                                      <span className={styles.ctDate}>{order.cancelledAt}</span>
                                    </div>
                                  </div>
                                </div>
                                {(order.cancelReason || order.paymentStatus) && (
                                  <div className={styles.cancelMeta}>
                                    {order.cancelReason && (
                                      <div className={styles.cancelMetaRow}>
                                        <b>Reason:</b> {order.cancelReason === 'other' && order.cancelReasonOther
                                          ? order.cancelReasonOther
                                          : String(order.cancelReason).replace(/_/g, ' ')}
                                      </div>
                                    )}
                                    <div className={styles.cancelMetaRow}>
                                      <b>Refund:</b> {['REFUNDED', 'REFUND_INITIATED', 'PAID'].includes(order.paymentStatus)
                                        ? 'Processed to original payment method'
                                        : 'No payment was captured'}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <h4 className={styles.expandHeading}>Delivery progress</h4>
                                <div className={styles.stepper}>
                                  {order.timeline.map((t: any, idx: number) => {
                                    const isDone = t.done;
                                    const isCurrent = !isDelivered && idx === doneCount;
                                    const connectorDone = idx < doneCount - 1;
                                    return (
                                      <div key={t.step} className={styles.step}>
                                        {idx > 0 && (
                                          <div className={`${styles.stepConnector} ${connectorDone || isDone ? styles.stepConnectorDone : ''}`}
                                            style={{ left: '-50%' }} />
                                        )}
                                        <div className={`${styles.stepDot} ${isDone ? styles.stepDoneDot : ''} ${isCurrent ? `${styles.stepCurrentDot} ${styles.pulseRing}` : ''}`}>
                                          {isDone ? <Check size={14} strokeWidth={3} /> : isCurrent ? <StatusIcon status={order.status} size={13} /> : <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', display: 'block' }} />}
                                        </div>
                                        <span className={`${styles.stepLabel} ${!isDone && !isCurrent ? styles.stepLabelMuted : ''}`}>{t.step}</span>
                                        {t.date && <span className={styles.stepDate}>{t.date}</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Price breakdown */}
                          <div className={styles.expandSide}>
                            <h4 className={styles.expandHeading}>Price details</h4>
                            <div className={styles.breakdown}>
                              <div className={styles.brRow}><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                              <div className={styles.brRow}><span>Delivery</span><span>{order.delivery > 0 ? formatPrice(order.delivery) : 'Free'}</span></div>
                              <div className={styles.brRow}><span>Taxes &amp; fees</span><span>{formatPrice(order.taxes)}</span></div>
                              {order.discount > 0 && (
                                <div className={`${styles.brRow} ${styles.brDiscount}`}><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>
                              )}
                              <div className={styles.brDivider} />
                              <div className={`${styles.brRow} ${styles.brTotal}`}><span>Total</span><span>{formatPrice(order.total)}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <button type="button" className={styles.loadMoreBtn} onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Load more orders ({filteredOrders.length - visibleCount} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      {filterSheetOpen && (
        <div
          className={styles.filterSheetBackdrop}
          onClick={() => setFilterSheetOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Filter orders"
        >
          <div className={styles.filterSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />

            <div className={styles.sheetHeader}>
              <div className={styles.sheetHeaderLeft}>
                <h2 className={styles.sheetTitle}>Filter Orders</h2>
                {(statusFilter !== 'All' || dateRange !== 'all') && (
                  <span className={styles.sheetActiveBadge}>
                    {(statusFilter !== 'All' ? 1 : 0) + (dateRange !== 'all' ? 1 : 0)} active
                  </span>
                )}
              </div>
              <div className={styles.sheetHeaderRight}>
                {(statusFilter !== 'All' || dateRange !== 'all') && (
                  <button
                    type="button"
                    className={styles.sheetResetBtn}
                    onClick={clearFilters}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setFilterSheetOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.sheetBody}>
              {/* Order Status */}
              <div className={styles.sheetSection}>
                <label className={styles.sheetSectionTitle}>Order Status</label>
                <div className={styles.sheetOptionsList}>
                  {tabs.map((t) => {
                    const isSelected = statusFilter === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.sheetOptionRow} ${isSelected ? styles.sheetOptionRowSelected : ''}`}
                        onClick={() => changeStatus(t)}
                      >
                        <div className={styles.sheetOptionInfo}>
                          <span className={styles.sheetOptionName}>{t === 'All' ? 'All Orders' : t}</span>
                          <span className={`${styles.sheetOptionCount} ${isSelected ? styles.sheetOptionCountActive : ''}`}>
                            {counts[t]}
                          </span>
                        </div>
                        {isSelected ? (
                          <div className={styles.sheetCheckDot}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className={styles.sheetUncheckDot} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Period */}
              <div className={styles.sheetSection}>
                <label className={styles.sheetSectionTitle}>Time Period</label>
                <div className={styles.sheetOptionsList}>
                  {DATE_RANGES.map((d) => {
                    const isSelected = dateRange === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        className={`${styles.sheetOptionRow} ${isSelected ? styles.sheetOptionRowSelected : ''}`}
                        onClick={() => changeDateRange(d.key)}
                      >
                        <div className={styles.sheetOptionInfo}>
                          <Calendar size={15} className={styles.sheetCalendarIcon} />
                          <span className={styles.sheetOptionName}>{d.label}</span>
                        </div>
                        {isSelected ? (
                          <div className={styles.sheetCheckDot}>
                            <Check size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className={styles.sheetUncheckDot} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.sheetFooter}>
              <button
                type="button"
                className={styles.sheetApplyBtn}
                onClick={() => setFilterSheetOpen(false)}
              >
                Show {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className={`${styles.toast} ${toastMessage.type === 'success' ? styles.toastSuccess : styles.toastError}`} role="status">
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModalOrder && (
        <div className={styles.modalBackdrop} onClick={() => setCancelModalOrder(null)} role="dialog" aria-modal="true" aria-label="Cancel order">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalIcon}><AlertCircle size={20} /></div>
              <div>
                <h3 className={styles.modalTitle}>Cancel order #{cancelModalOrder.id}</h3>
                <p className={styles.modalSub}>Are you sure you want to cancel this order?</p>
              </div>
              <button type="button" className={styles.modalClose} onClick={() => setCancelModalOrder(null)} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className={styles.modalLabel} htmlFor="cancel-reason">Please select a reason</label>
              <select
                id="cancel-reason"
                className={styles.modalSelect}
                style={{ marginTop: 8 }}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="changed_mind">Changed my mind</option>
                <option value="ordered_by_mistake">Ordered by mistake</option>
                <option value="found_cheaper">Found cheaper elsewhere</option>
                <option value="other">Other reason</option>
              </select>
              {cancelReason === 'other' && (
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Please specify your reason…"
                  value={cancelReasonOther}
                  onChange={(e) => setCancelReasonOther(e.target.value)}
                  maxLength={200}
                />
              )}
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setCancelModalOrder(null)} disabled={cancelling}>
                Keep Order
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? <><Loader2 size={16} className="animate-spin" /> Cancelling…</> : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
