"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronRight, Package, ArrowRight, FileText, Truck, Star, RefreshCw, X, Filter, SlidersHorizontal } from 'lucide-react';
import styles from './Orders.module.css';

// Mock Data
const orders = [
  {
    id: 'ORD-89241',
    date: 'Aug 15, 2026',
    total: 1499,
    status: 'Delivered',
    statusDate: 'Delivered on Aug 18, 2026',
    statusSubtext: 'Your package was delivered to your doorstep.',
    items: [
      { name: 'Ceramic Anti-Slip Pet Bowl', variant: 'Matte White', image: '/hero-products/pet_bowl.png' }
    ]
  },
  {
    id: 'ORD-88102',
    date: 'Aug 02, 2026',
    total: 2697,
    status: 'Processing',
    statusDate: 'Est. Delivery by Aug 22',
    statusSubtext: 'Item received at distribution hub & being prepared for dispatch.',
    items: [
      { name: 'Premium Leather Dog Collar', variant: 'Brown / Large', image: '/hero-products/dog_food.png' }
    ]
  },
  {
    id: 'ORD-87004',
    date: 'July 15, 2026',
    total: 450,
    status: 'Cancelled',
    statusDate: 'Cancelled on July 16, 2026',
    statusSubtext: 'Order cancelled as requested. Refund processed to original payment method.',
    items: [
      { name: 'Interactive Cat Toy', variant: 'Blue Feather', image: '/hero-products/cat_treats.png' }
    ]
  }
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [timeFilter, setTimeFilter] = useState<string>('All Time');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterTabs = ['All', 'On the way', 'Delivered', 'Cancelled'];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesProduct = order.items.some(item => 
          item.name.toLowerCase().includes(query)
        );
        if (!matchesId && !matchesProduct) return false;
      }

      if (activeTab === 'On the way') {
        if (order.status !== 'Processing') return false;
      } else if (activeTab === 'Delivered') {
        if (order.status !== 'Delivered') return false;
      } else if (activeTab === 'Cancelled') {
        if (order.status !== 'Cancelled') return false;
      }

      if (timeFilter === '2026' && !order.date.includes('2026')) return false;
      if (timeFilter === '2025' && !order.date.includes('2025')) return false;

      return true;
    });
  }, [searchQuery, activeTab, timeFilter]);

  const handleDownloadInvoice = (orderId: string) => {
    if (typeof window !== 'undefined') {
      alert(`Downloading tax invoice for ${orderId}...`);
    }
  };

  const hasActiveFilters = activeTab !== 'All' || timeFilter !== 'All Time';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Page Header */}
        <div className={styles.pageHeaderRow}>
          <div>
            <h1 className={styles.pageTitle}>My Orders</h1>
            <p className={styles.pageSubtitle}>Track, manage, and review your recent pet purchases</p>
          </div>
        </div>

        {/* Single Row: Search Bar (Left) + Filter Icon Button (Right) */}
        <div className={styles.searchFilterRow}>
          <div className={styles.searchBarWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search by order ID or product name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className={styles.searchClearBtn}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`${styles.filterToggleBtn} ${isFilterOpen || hasActiveFilters ? styles.filterActiveBtn : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label="Toggle filter options"
          >
            <SlidersHorizontal size={16} />
            <span className={styles.filterBtnLabel}>Filters</span>
            {hasActiveFilters && <span className={styles.activeFilterDot} />}
          </button>
        </div>

        {/* Floating Filter Dialog Box Modal */}
        {isFilterOpen && (
          <div className={styles.filterModalBackdrop} onClick={() => setIsFilterOpen(false)}>
            <div className={styles.filterModalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.filterModalHeader}>
                <div className={styles.filterModalTitleGroup}>
                  <SlidersHorizontal size={18} color="#FD802E" />
                  <h3 className={styles.filterModalTitle}>Filter Orders</h3>
                </div>
                <div className={styles.modalHeaderActions}>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className={styles.resetFilterBtn}
                      onClick={() => {
                        setActiveTab('All');
                        setTimeFilter('All Time');
                      }}
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.filterModalCloseBtn}
                    onClick={() => setIsFilterOpen(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.filterModalBody}>
                {/* Status Filter Section */}
                <div className={styles.modalFilterSection}>
                  <h4 className={styles.modalFilterSectionTitle}>Order Status</h4>
                  <div className={styles.modalPillsRow}>
                    {filterTabs.map((tab) => {
                      const isActive = activeTab === tab;
                      const count = tab === 'All' 
                        ? orders.length 
                        : tab === 'On the way' 
                        ? orders.filter(o => o.status === 'Processing').length
                        : orders.filter(o => o.status === tab).length;

                      return (
                        <button
                          key={tab}
                          type="button"
                          className={`${styles.statusPillBtn} ${isActive ? styles.statusPillActive : ''}`}
                          onClick={() => setActiveTab(tab)}
                        >
                          <span>{tab}</span>
                          <span className={styles.pillCountBadge}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Filter Section */}
                <div className={styles.modalFilterSection}>
                  <h4 className={styles.modalFilterSectionTitle}>Order Time Period</h4>
                  <div className={styles.modalPillsRow}>
                    {[
                      { label: 'All Time', value: 'All Time' },
                      { label: 'Last 30 Days', value: 'Last 30 days' },
                      { label: 'Year 2026', value: '2026' },
                      { label: 'Year 2025', value: '2025' }
                    ].map((opt) => {
                      const isActive = timeFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`${styles.statusPillBtn} ${isActive ? styles.statusPillActive : ''}`}
                          onClick={() => setTimeFilter(opt.value)}
                        >
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.filterModalFooter}>
                <button
                  type="button"
                  className={styles.applyFilterBtn}
                  onClick={() => setIsFilterOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className={styles.ordersList}>
          {filteredOrders.length === 0 ? (
            <div className={styles.emptyStateCard}>
              <div className={styles.emptyIconCircle}>
                <Package size={32} color="#FD802E" />
              </div>
              <h3 className={styles.emptyTitle}>No Orders Found</h3>
              <p className={styles.emptySubtext}>
                We couldn't find any orders matching your selected filters or search query.
              </p>
              <Link href="/category" className={styles.emptyShopBtn}>
                <span>Explore Catalog</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className={styles.orderCardContainer}>
                
                {/* 1. Card Top Bar: Order ID + Date + Price + Invoice CTA */}
                <div className={styles.cardHeaderBar}>
                  <div className={styles.cardHeaderMetaGroup}>
                    <span className={styles.orderIdLabel}>Order</span>
                    <span className={styles.orderIdValue}>#{order.id}</span>
                    <span className={styles.headerDotSeparator}>•</span>
                    <span className={styles.orderDateText}>{order.date}</span>
                  </div>

                  <div className={styles.cardHeaderRight}>
                    <span className={styles.orderPriceTag}>₹{order.total.toLocaleString()}</span>
                    <button 
                      type="button" 
                      className={styles.invoiceBtn}
                      onClick={() => handleDownloadInvoice(order.id)}
                      title="Download Invoice"
                    >
                      <FileText size={13} />
                      <span className={styles.invoiceBtnText}>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* 2. Card Main Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardProductRow}>
                    {/* Thumbnail Image */}
                    <div className={styles.cardImageContainer}>
                      <Image 
                        src={order.items[0].image} 
                        alt={order.items[0].name} 
                        fill 
                        className={styles.cardProductImg} 
                      />
                    </div>

                    {/* Product Details & Status */}
                    <div className={styles.cardProductMeta}>
                      <div className={styles.cardStatusBadgeRow}>
                        <span className={`${styles.statusPill} ${
                          order.status === 'Delivered' ? styles.statusGreen : 
                          order.status === 'Processing' ? styles.statusOrange : 
                          styles.statusRed
                        }`}>
                          <span className={styles.statusDot} />
                          {order.status}
                        </span>
                        <span className={styles.statusDateText}>{order.statusDate}</span>
                      </div>

                      <Link href={`/orders/${order.id}`} className={styles.cardProductTitle}>
                        {order.items[0].name}
                      </Link>

                      <span className={styles.cardProductVariant}>Variant: {order.items[0].variant}</span>
                      <p className={styles.cardStatusSubtext}>{order.statusSubtext}</p>
                    </div>
                  </div>

                  {/* 3. Card Footer Action Bar */}
                  <div className={styles.cardFooterActions}>
                    <Link href={`/orders/${order.id}`} className={styles.cardDetailsLink}>
                      <span>View Order Details</span>
                      <ChevronRight size={14} />
                    </Link>

                    {order.status === 'Processing' ? (
                      <Link href={`/orders/${order.id}/tracking`} className={styles.primaryActionBtn}>
                        <Truck size={14} />
                        <span>Track Package</span>
                      </Link>
                    ) : order.status === 'Cancelled' ? (
                      <Link href="/category" className={styles.primaryActionBtn}>
                        <RefreshCw size={14} />
                        <span>Reorder Item</span>
                      </Link>
                    ) : (
                      <Link href="/product/d-1/reviews" className={styles.primaryActionBtn}>
                        <Star size={14} fill="#ffffff" color="#ffffff" />
                        <span>Rate &amp; Review</span>
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
