"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package, Search, ChevronDown, MapPin, Check, CheckCircle2,
  RefreshCw, FileText, ArrowLeft, Filter, X
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
  return 'Processing';
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

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedOrders);
    if(next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedOrders(next);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUserOrders = async () => {
      setLoading(true);
      try {
        const res = await orderService.getOrders();
        if (isMounted && res && Array.isArray(res.orders) && res.orders.length > 0) {
          const formatted = res.orders.map((o: any) => {
            const displayStatus = formatOrderStatus(o.orderStatus || o.status);
            return {
              id: o.orderNumber || o.id,
              rawId: o.id,
              date: formatDate(o.createdAt),
              status: displayStatus,
              total: o.grandTotal || o.totalAmount || 0,
              items: (o.items || []).map((item: any) => ({
                id: item.id,
                name: item.productName || item.name || 'Pet Product',
                variant: item.variantName || item.variant || 'Standard',
                qty: item.quantity || item.qty || 1,
                price: item.price || 0,
                image: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&q=80'
              })),
              timeline: [
                { step: 'Placed', date: formatDate(o.createdAt), done: true },
                { step: 'Packed', date: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus) ? formatDate(o.createdAt) : '', done: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus) },
                { step: 'Shipped', date: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus) ? formatDate(o.createdAt) : '', done: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus) },
                { step: 'Delivered', date: o.orderStatus === 'DELIVERED' ? formatDate(o.updatedAt || o.createdAt) : '', done: o.orderStatus === 'DELIVERED' }
              ]
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
        console.error("Failed to fetch orders from server:", err);
        setOrders([]);
        setExpandedOrders(new Set());
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserOrders();
    return () => { isMounted = false; };
  }, []);

  const handleReorderClick = async (orderId: string, rawId?: string) => {
    const targetId = rawId || orderId;
    try {
      const res = await orderService.reorder(targetId);
      if (res && res.success) {
        alert("Items added to your cart successfully!");
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-item-added'));
        }
      } else {
        alert("Items added to cart!");
      }
    } catch (err: any) {
      console.error("Reorder failed:", err);
      alert(err?.message || "Failed to reorder items. Please try again.");
    }
  };

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.items.some((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <>
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
            <p className={styles.pageSubtitle}>Track, manage and review your past purchases</p>
          </div>
        </div>

        {/* Search Row + Filter Icon Button */}
        <div className={styles.ordersToolbarRow}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
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

        {loading ? (
          <div className={styles.ordersList}>
            <Skeleton className={styles.orderCardSkeleton} style={{ height: 250 }} />
            <Skeleton className={styles.orderCardSkeleton} style={{ height: 250 }} />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {filteredOrders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderCardHeaderRow}>
                  <div className={styles.orderMetaCol}>
                    <span className={styles.orderIdBadge}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <Badge variant={order.status.toLowerCase() as any}>{order.status}</Badge>
                </div>

                <div className={styles.orderTimelineWrap}>
                  <button type="button" className={styles.timelineToggle} onClick={() => toggleExpanded(order.id)}>
                    <CheckCircle2 size={16} color="var(--acc-success, #16A34A)" />
                    <span>{order.status} on {order.date}</span>
                    <ChevronDown size={16} className={`${styles.timelineChevron} ${expandedOrders.has(order.id) ? styles.timelineChevronOpen : ''}`} />
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

                <div className={styles.orderItemsPreview}>
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemThumbWrap}>
                        <Image src={item.image} alt={item.name} width={60} height={60} className={styles.itemThumb} />
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemVariant}>{item.variant} • Qty: {item.qty}</span>
                      </div>
                      <span className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderCardFooterRow}>
                  <div className={styles.orderTotalCol}>
                    <span className={styles.totalLabel}>Total Amount</span>
                    <span className={styles.totalValue}>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.orderActions}>
                    <Link href={`/orders/${order.rawId || order.id}/invoice`}>
                      <Button variant="secondary" size="sm" icon={<FileText size={15} />}>Invoice</Button>
                    </Link>
                    {order.status === 'Processing' ? (
                      <Link href={`/orders/${order.rawId || order.id}/tracking`}>
                        <Button variant="primary" size="sm" icon={<MapPin size={15} />}>Track</Button>
                      </Link>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<RefreshCw size={15} />}
                        onClick={() => handleReorderClick(order.id, order.rawId)}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package size={48} />}
            title="No orders found"
            description="You haven't placed any orders that match your filters."
            action={<Link href="/shop"><Button variant="primary">Start Shopping</Button></Link>}
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
              {statuses.map(s => (
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
    </>
  );
}
