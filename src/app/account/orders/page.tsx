"use client";

import { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, CheckCircle2, Clock, Search, XCircle, 
  ClipboardList, ClipboardCheck, Truck, PackageCheck, Check, ChevronRight, FileText,
  MapPin, AlertCircle, SlidersHorizontal, X, Calendar, CalendarDays, History, ArrowDownWideNarrow, ArrowUpWideNarrow
} from 'lucide-react';
import styles from '../Account.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';

const initialUserData = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  memberSince: '2025',
  totalOrders: 12,
  points: 1240,
  tier: 'Gold Paw VIP',
};

const orders = [
  {
    id: 'ORD-89241',
    date: 'Aug 18, 2026',
    total: 1499,
    status: 'Delivered',
    deliveryText: 'Delivered on Aug 18, 2026',
    items: [
      { name: 'Ceramic Anti-Slip Pet Bowl', variant: 'Matte White', qty: 1, price: 1499, image: '/hero-products/pet_bowl.png' }
    ]
  },
  {
    id: 'ORD-88102',
    date: 'Aug 02, 2026',
    total: 2697,
    status: 'Processing',
    deliveryText: 'Expected delivery by Aug 22, 2026',
    progress: 1,
    items: [
      { name: 'Premium Leather Dog Collar', variant: 'Brown / Large', qty: 1, price: 2697, image: '/hero-products/dog_food.png' }
    ]
  },
  {
    id: 'ORD-88055',
    date: 'Jul 28, 2026',
    total: 3299,
    status: 'Shipped',
    deliveryText: 'Shipped • Expected delivery by Aug 05, 2026',
    items: [
      { name: 'Automatic Pet Water Fountain', variant: 'Stainless Steel', qty: 1, price: 3299, image: '/hero-products/cat_treats.png' }
    ]
  },
  {
    id: 'ORD-87004',
    date: 'Jul 15, 2026',
    total: 450,
    status: 'Cancelled',
    deliveryText: 'Order Cancelled on Jul 15, 2026',
    items: [
      { name: 'Interactive Cat Toy', variant: 'Blue Feather', qty: 1, price: 450, image: '/hero-products/cat_treats.png' }
    ]
  }
];

function AccountOrdersContent() {
  const [userData] = useState(initialUserData);
  const [orderFilter, setOrderFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price-desc', 'price-asc'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'last30', '2026', '2025'
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isAnyFilterActive = orderFilter !== 'All' || sortBy !== 'newest' || dateFilter !== 'all';

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (orderFilter !== 'All' && order.status !== orderFilter) return false;
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(query);
      const matchesProduct = order.items.some(item => item.name.toLowerCase().includes(query));
      if (!matchesId && !matchesProduct) return false;
    }

    // Time period filter
    if (dateFilter === '2026' && !order.date.includes('2026')) return false;
    if (dateFilter === '2025' && !order.date.includes('2025')) return false;
    if (dateFilter === 'last30' && !order.date.includes('Aug')) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'price-desc') {
      return b.total - a.total;
    }
    if (sortBy === 'price-asc') {
      return a.total - b.total;
    }
    // Default: newest first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={13} />;
      case 'Processing': return <Clock size={13} />;
      case 'Shipped': return <Truck size={13} />;
      case 'Cancelled': return <XCircle size={13} />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Delivered': return styles.statusDelivered;
      case 'Processing': return styles.statusProcessing;
      case 'Shipped': return styles.statusShipped;
      case 'Cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const getBannerIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <Truck size={16} className={styles.bannerIconDelivered} />;
      case 'Processing': return <Clock size={16} className={styles.bannerIconProcessing} />;
      case 'Shipped': return <Truck size={16} className={styles.bannerIconShipped} />;
      case 'Cancelled': return <AlertCircle size={16} className={styles.bannerIconCancelled} />;
      default: return <Truck size={16} />;
    }
  };

  const getBannerClass = (status: string) => {
    switch (status) {
      case 'Delivered': return styles.bannerDelivered;
      case 'Processing': return styles.bannerProcessing;
      case 'Shipped': return styles.bannerShipped;
      case 'Cancelled': return styles.bannerCancelled;
      default: return '';
    }
  };

  const renderProgressTracker = (progress: number, orderDate: string) => {
    const steps = [
      { label: 'Order Placed', time: `${orderDate}\n11:00 AM`, Icon: ClipboardList },
      { label: 'Accepted', time: `${orderDate}\n11:15 AM`, Icon: ClipboardCheck },
      { label: 'In Progress', time: `Expected\nTomorrow`, Icon: Package },
      { label: 'On the Way', time: `Expected\nIn 2 Days`, Icon: Truck },
      { label: 'Delivered', time: `Expected\nIn 3 Days`, Icon: PackageCheck }
    ];
    
    const activeIndex = progress === 1 ? 2 : progress === 2 ? 3 : progress === 3 ? 4 : 0;
    const fillWidthPercent = (activeIndex / (steps.length - 1)) * 80;

    return (
      <div className={styles.progressTrackerCard}>
        <div className={styles.trackerHeader}>
          <span className={styles.trackerHeaderTitle}>Order Progress Timeline</span>
          <span className={styles.trackerHeaderBadge}>
            <Clock size={12} /> Live Updates
          </span>
        </div>

      <div className={styles.stepperMainRow}>
        <div className={styles.stepperScrollTrack}>
          <div className={styles.progressLineBg}></div>
          <div className={styles.progressLineFill} style={{ width: `${fillWidthPercent}%` }}></div>
          
          <div className={styles.stepsWrapper}>
            {steps.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;

              let stepClass = styles.upcoming;
              if (isCompleted) stepClass = styles.completed;
              if (isActive) stepClass = styles.activeStep;

              return (
                <div key={idx} className={`${styles.stepContainer} ${stepClass}`}>
                  <div className={styles.nodeCircleWrapper}>
                    {isActive && <div className={styles.pulseBeacon} />}
                    <div className={styles.nodeCircle}>
                      <step.Icon size={18} strokeWidth={2.2} />
                    </div>
                    {isCompleted && (
                      <div className={styles.completedBadgeIcon}>
                        <Check size={10} color="white" strokeWidth={3.5} />
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.stepMetaGroup}>
                    <span className={styles.stepLabel}>{step.label}</span>
                    <div className={styles.stepTime}>
                      {step.time.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <div className={styles.accountLayout}>
          
          {/* Account Navigation Sidebar */}
          <AccountSidebarNav user={userData} />

          {/* Main Orders Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.ordersPageWrapper}>
              
              {/* 1. Header Title Section */}
              <div className={styles.ordersHeaderGroup}>
                <h1 className={styles.ordersTitle}>My Orders</h1>
                <p className={styles.ordersSubtitle}>Track, manage and reorder your purchases.</p>
              </div>

              {/* 2. Search Input Bar + Icon-Only Filter Button */}
              <div className={styles.ordersSearchFilterRow}>
                <div className={styles.ordersSearchBox}>
                  <Search className={styles.ordersSearchIcon} size={18} />
                  <input 
                    type="text" 
                    className={styles.ordersSearchInput} 
                    placeholder="Search by order ID, product name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      className={styles.clearSearchBtn}
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>

                <button 
                  type="button" 
                  className={`${styles.ordersFilterIconButton} ${isAnyFilterActive ? styles.activeFilterIconBtn : ''}`}
                  onClick={() => setIsFilterOpen(true)}
                  aria-label="Open filter and sort options"
                  title="Filter & Sort Orders"
                >
                  <SlidersHorizontal size={18} />
                  {isAnyFilterActive && <span className={styles.filterDotBeacon} />}
                </button>
              </div>

              {/* Active Filter Chips Bar (if filters are active) */}
              {isAnyFilterActive && (
                <div className={styles.activeFiltersBar}>
                  <span className={styles.activeFiltersLabel}>Active Filters:</span>
                  {sortBy !== 'newest' && (
                    <span className={styles.activeFilterChipTag}>
                      Sort: {sortBy === 'oldest' ? 'Oldest' : sortBy === 'price-desc' ? 'Price High-Low' : 'Price Low-High'}
                    </span>
                  )}
                  {orderFilter !== 'All' && (
                    <span className={styles.activeFilterChipTag}>
                      Status: {orderFilter}
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className={styles.activeFilterChipTag}>
                      Period: {dateFilter === 'last30' ? 'Last 30 Days' : `Year ${dateFilter}`}
                    </span>
                  )}
                  <button 
                    type="button" 
                    className={styles.resetFiltersLink}
                    onClick={() => {
                      setOrderFilter('All');
                      setSortBy('newest');
                      setDateFilter('all');
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* 3. Orders Cards Stack */}
              <div className={styles.ordersCardsStack}>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <div key={order.id} className={styles.myOrderCard}>
                    {/* Header Row: Order ID, Date, Status Badge, Chevron */}
                    <div className={styles.cardHeaderRow}>
                      <div className={styles.cardHeaderMeta}>
                        <span className={styles.cardOrderId}>{order.id}</span>
                        <span className={styles.cardOrderDate}>{order.date}</span>
                      </div>
                      
                      <div className={styles.cardStatusPillGroup}>
                        <span className={`${styles.statusBadgePill} ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                        <ChevronRight size={18} className={styles.cardChevronIcon} />
                      </div>
                    </div>

                    {/* Subtle Divider Line */}
                    <div className={styles.cardRowDivider} />

                    {/* Progress Timeline on Processing Orders */}
                    {order.status === 'Processing' && order.progress !== undefined && (
                      <div style={{ margin: '0.5rem 0 0.85rem' }}>
                        {renderProgressTracker(order.progress, order.date)}
                      </div>
                    )}
                    
                    {/* Product Items List */}
                    <div className={styles.cardProductList}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className={styles.cardProductRow}>
                          <div className={styles.cardProductThumb}>
                            <Image src={item.image} alt={item.name} fill className={styles.cardThumbImg} />
                          </div>
                          <div className={styles.cardProductMeta}>
                            <Link href={`/orders/${order.id}`} className={styles.cardProductName}>
                              {item.name}
                            </Link>
                            <span className={styles.cardProductVariant}>
                              {item.variant} &nbsp;|&nbsp; Qty: {item.qty || 1}
                            </span>
                            <span className={styles.cardProductPrice}>
                              ₹{(item.price || order.total).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Status Banner */}
                    <div className={`${styles.cardDeliveryBanner} ${getBannerClass(order.status)}`}>
                      <div className={styles.cardDeliveryLeft}>
                        {getBannerIcon(order.status)}
                        <span>{order.deliveryText || (order.status === 'Delivered' ? `Delivered on ${order.date}` : `Expected delivery soon`)}</span>
                      </div>
                      <ChevronRight size={16} className={styles.cardDeliveryChevron} />
                    </div>

                    {/* Action Buttons Row */}
                    <div className={styles.cardActionsRow}>
                      <Link 
                        href={`/orders/${order.id}/invoice`} 
                        className={styles.cardOutlineBtn}
                      >
                        <FileText size={15} />
                        <span>View Invoice</span>
                      </Link>

                      {order.status === 'Processing' ? (
                        <Link 
                          href={`/orders/${order.id}`} 
                          className={styles.cardSolidBtn}
                        >
                          <MapPin size={15} />
                          <span>Track Package</span>
                        </Link>
                      ) : (
                        <Link 
                          href={`/orders/${order.id}`} 
                          className={styles.cardSolidBtn}
                        >
                          <Package size={15} />
                          <span>View Order</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyStateCard}>
                    <div className={styles.emptyIconCircle}>
                      <Package size={30} color="#FD802E" />
                    </div>
                    <h3 className={styles.emptyStateTitle}>No Orders Found</h3>
                    <p className={styles.emptyStateDesc}>We couldn't find any orders matching your selected criteria.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Mobile Footer Support Card */}
            <div className={styles.mobileOnlyFooterGroup}>
              <div className={styles.mobileHelpBannerCard}>
                <div className={styles.helpLeftSection}>
                  <div className={styles.helpMascotCircle}>
                    <span className={styles.dogEmoji}>🐶</span>
                  </div>
                  <div className={styles.helpTextGroup}>
                    <span className={styles.helpTitle}>Need Help?</span>
                    <span className={styles.helpSubtitle}>We're here for you!</span>
                  </div>
                </div>
              </div>
              <div className={styles.madeWithLoveFooter}>
                <span>Made with ❤️ by <strong>KickAt</strong></span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Filter & Sort Bottom Sheet Drawer */}
      {isFilterOpen && (
        <div className={styles.bottomSheetBackdrop} onClick={() => setIsFilterOpen(false)}>
          <div className={styles.bottomSheetCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dragHandleBar} />

            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <SlidersHorizontal size={18} color="#FD802E" />
                <h2>Filter & Sort Orders</h2>
              </div>
              <button 
                type="button" 
                className={styles.modalCloseBtn} 
                onClick={() => setIsFilterOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.filterModalScrollBody}>
              {/* 1. Sort By (Date & Price) */}
              <div className={styles.filterSectionBlock}>
                <span className={styles.filterModalLabel}>Sort By</span>
                <div className={styles.filterOptionsGrid}>
                  {[
                    { key: 'newest', label: 'Newest First', Icon: Calendar },
                    { key: 'oldest', label: 'Oldest First', Icon: History },
                    { key: 'price-desc', label: 'Price: High to Low', Icon: ArrowDownWideNarrow },
                    { key: 'price-asc', label: 'Price: Low to High', Icon: ArrowUpWideNarrow },
                  ].map(opt => (
                    <button 
                      key={opt.key}
                      type="button"
                      className={`${styles.filterOptionChip} ${sortBy === opt.key ? styles.filterOptionActive : ''}`}
                      onClick={() => setSortBy(opt.key)}
                    >
                      <opt.Icon size={14} className={styles.optionChipIcon} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Order Status Filter */}
              <div className={styles.filterSectionBlock}>
                <span className={styles.filterModalLabel}>Order Status</span>
                <div className={styles.filterOptionsGrid}>
                  {[
                    { key: 'All', label: 'All Orders', Icon: Package },
                    { key: 'Processing', label: 'Processing', Icon: Clock },
                    { key: 'Shipped', label: 'Shipped', Icon: Truck },
                    { key: 'Delivered', label: 'Delivered', Icon: CheckCircle2 },
                    { key: 'Cancelled', label: 'Cancelled', Icon: XCircle },
                  ].map(opt => (
                    <button 
                      key={opt.key}
                      type="button"
                      className={`${styles.filterOptionChip} ${orderFilter === opt.key ? styles.filterOptionActive : ''}`}
                      onClick={() => setOrderFilter(opt.key)}
                    >
                      <opt.Icon size={14} className={styles.optionChipIcon} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Time Period / Date Range Filter */}
              <div className={styles.filterSectionBlock}>
                <span className={styles.filterModalLabel}>Time Period</span>
                <div className={styles.filterOptionsGrid}>
                  {[
                    { key: 'all', label: 'All Time', Icon: Calendar },
                    { key: 'last30', label: 'Last 30 Days', Icon: Clock },
                    { key: '2026', label: 'Year 2026', Icon: CalendarDays },
                    { key: '2025', label: 'Year 2025', Icon: CalendarDays },
                  ].map(opt => (
                    <button 
                      key={opt.key}
                      type="button"
                      className={`${styles.filterOptionChip} ${dateFilter === opt.key ? styles.filterOptionActive : ''}`}
                      onClick={() => setDateFilter(opt.key)}
                    >
                      <opt.Icon size={14} className={styles.optionChipIcon} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.filterModalFooter}>
              {isAnyFilterActive && (
                <button 
                  type="button" 
                  className={styles.actionBtn}
                  onClick={() => {
                    setOrderFilter('All');
                    setSortBy('newest');
                    setDateFilter('all');
                  }}
                >
                  Reset All
                </button>
              )}
              <button 
                type="button" 
                className={`${styles.actionBtn} ${styles.primaryBtn}`}
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading your orders...</div>}>
      <AccountOrdersContent />
    </Suspense>
  );
}
