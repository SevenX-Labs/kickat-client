"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, Search, Filter, X, ChevronDown, MapPin, Check, CheckCircle2, 
  RefreshCw, ChevronRight, FileText
} from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
// import { orderService } from '@/services/orderService'; // Assume it will be created

function AccountOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => { const next = new Set(expandedOrders); if(next.has(id)) next.delete(id); else next.add(id); setExpandedOrders(next); };

  useEffect(() => {
    // Fetch orders from API
    // const fetchOrders = async () => {
    //   try {
    //     const res = await orderService.getOrders();
    //     setOrders(res.data || []);
    //   } catch (err) { ... }
    // };
    // fetchOrders();
    
    // For now, simulate API fetch
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-89241',
          date: '18 Aug 2026',
          status: 'Delivered',
          total: 4299,
          items: [
            { name: 'Premium Leather Dog Collar', variant: 'Large, Brown', qty: 1, price: 1299, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&q=80' },
            { name: 'Organic Beef Dog Treats', variant: '500g', qty: 2, price: 1500, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&q=80' }
          ],
          timeline: [
            { step: 'Placed', date: '15 Aug 2026', done: true },
            { step: 'Packed', date: '16 Aug 2026', done: true },
            { step: 'Shipped', date: '17 Aug 2026', done: true },
            { step: 'Delivered', date: '18 Aug 2026', done: true }
          ]
        },
        {
          id: 'ORD-89255',
          date: '10 Aug 2026',
          status: 'Processing',
          total: 1599,
          items: [
            { name: 'Cat Tree Tower', variant: 'Grey, 150cm', qty: 1, price: 1599, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&q=80' }
          ],
          timeline: [
            { step: 'Placed', date: '10 Aug 2026', done: true },
            { step: 'Packed', date: '11 Aug 2026', done: false },
            { step: 'Shipped', date: '', done: false },
            { step: 'Delivered', date: '', done: false }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.items.some((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className={styles.contentArea}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageH1}>My Orders</h1>
            <p className={styles.pageSubtitle}>Track, manage and review your past purchases</p>
          </div>
        </div>

        <div className={styles.ordersToolbar}>
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
          <div className={styles.statusChips}>
            {statuses.map(s => (
              <button 
                key={s} 
                className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
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
                  <Badge variant={order.status.toLowerCase()}>{order.status}</Badge>
                </div>

                <div className={styles.orderTimelineWrap}>
                  <button className={styles.timelineToggle} onClick={() => toggleExpanded(order.id)}>
                    <CheckCircle2 size={16} color="var(--acc-success)" />
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
                        <Image src={item.image} alt={item.name} width={50} height={50} className={styles.itemThumb} />
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
                    <Button variant="secondary" size="sm" icon={<FileText size={16} />}>Invoice</Button>
                    {order.status === 'Processing' ? (
                      <Button variant="primary" size="sm" icon={<MapPin size={16} />}>Track</Button>
                    ) : (
                      <Button variant="primary" size="sm" icon={<RefreshCw size={16} />}>Reorder</Button>
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
    </>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <AccountOrdersContent />
    </Suspense>
  );
}
