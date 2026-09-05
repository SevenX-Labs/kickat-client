"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, CheckCircle2, Clock, Search, XCircle, 
  ClipboardList, ClipboardCheck, Truck, PackageCheck, Check, Sparkles, ChevronRight, FileText
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
    date: 'August 18, 2026',
    total: 1499,
    status: 'Delivered',
    items: [
      { name: 'Ceramic Anti-Slip Pet Bowl', variant: 'Matte White', image: '/hero-products/pet_bowl.png' }
    ]
  },
  {
    id: 'ORD-88102',
    date: 'August 02, 2026',
    total: 2697,
    status: 'Processing',
    progress: 1, // 0: Placed, 1: Packed, 2: Shipped, 3: Delivered
    items: [
      { name: 'Premium Leather Dog Collar', variant: 'Brown / Large', image: '/hero-products/dog_food.png' },
      { name: 'Organic Cat Treats', variant: 'Salmon Flavor', image: '/hero-products/cat_treats.png' }
    ]
  },
  {
    id: 'ORD-87004',
    date: 'July 15, 2026',
    total: 450,
    status: 'Cancelled',
    items: [
      { name: 'Interactive Cat Toy', variant: 'Blue Feather', image: '/hero-products/cat_treats.png' }
    ]
  }
];

function AccountOrdersContent() {
  const router = useRouter();
  const [userData] = useState(initialUserData);
  const [orderFilter, setOrderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    if (orderFilter !== 'All' && order.status !== orderFilter) return false;
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={13} />;
      case 'Processing': return <Clock size={13} />;
      case 'Cancelled': return <XCircle size={13} />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Delivered': return styles.delivered;
      case 'Processing': return styles.processing;
      case 'Cancelled': return styles.cancelled;
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
    
    const activeIndex = progress === 1 ? 2 : progress === 2 ? 3 : progress === 3 ? 4 : 1;

    return (
      <div className={styles.progressTrackerCard}>
        <div className={styles.progressLineBg}></div>
        <div className={styles.progressLineFill} style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}></div>
        
        <div className={styles.stepsWrapper}>
          {steps.map((step, idx) => (
            <div key={idx} className={`${styles.stepContainer} ${idx <= activeIndex ? styles.completed : ''}`}>
              <div className={styles.stepTopIcon}>
                <step.Icon size={22} strokeWidth={2} className={idx <= activeIndex ? styles.iconActive : styles.iconInactive} />
                {idx <= activeIndex && <div className={styles.iconYellowAccent}></div>}
              </div>
              
              <span className={styles.stepLabel}>{step.label}</span>
              
              <div className={styles.stepCheckWrapper}>
                {idx <= activeIndex ? (
                  <div className={styles.checkSquareFilled}><Check size={14} color="white" strokeWidth={3} /></div>
                ) : (
                  <div className={styles.checkSquareEmpty}><Check size={14} color="white" strokeWidth={3} /></div>
                )}
              </div>
              
              <div className={styles.stepTime}>
                {step.time.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <div className={styles.accountLayout}>
          
          {/* Account Navigation */}
          <AccountSidebarNav user={userData} />

          {/* Main Orders Content */}
          <div className={styles.contentArea}>
            <div className={styles.tabContentCard}>
              <div className={styles.sectionHeader}>
                <h1 className={styles.title}>My Orders</h1>
                <p className={styles.subtitle}>Check the status of recent orders, manage returns, and track deliveries.</p>
              </div>

              {/* Filter and Search Bar */}
              <div className={styles.controlsBar}>
                <div className={styles.filterTabs}>
                  {['All', 'Processing', 'Delivered', 'Cancelled'].map(tab => (
                    <button 
                      key={tab} 
                      type="button"
                      className={`${styles.tabBtn} ${orderFilter === tab ? styles.active : ''}`}
                      onClick={() => setOrderFilter(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className={styles.searchBox}>
                  <Search className={styles.searchIcon} size={15} />
                  <input 
                    type="text" 
                    className={styles.searchInput} 
                    placeholder="Search by order ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Orders Cards List */}
              <div className={styles.ordersList}>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderMetaGrid}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Order Placed</span>
                          <span className={styles.metaValue}>{order.date}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Total Amount</span>
                          <span className={styles.metaValue}>₹{order.total.toLocaleString()}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Order Number</span>
                          <Link href={`/account/orders/${order.id}`} className={`${styles.metaValue} ${styles.mono}`}>
                            #{order.id}
                          </Link>
                        </div>
                      </div>
                      
                      <div className={styles.orderStatus}>
                        <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {order.status === 'Processing' && order.progress !== undefined && (
                      <div style={{ marginBottom: '1.25rem', padding: '0 0.5rem' }}>
                        {renderProgressTracker(order.progress, order.date)}
                      </div>
                    )}
                    
                    <div className={styles.orderBody}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className={styles.orderItemRow}>
                          <div className={styles.itemThumb}>
                            <Image src={item.image} alt={item.name} fill className={styles.itemThumbImg} />
                          </div>
                          <div className={styles.itemDetails}>
                            <Link href={`/account/orders/${order.id}`} className={styles.itemName}>
                              {item.name}
                            </Link>
                            <div className={styles.itemVariant}>Variant: {item.variant}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.orderFooter}>
                      <Link 
                        href={`/account/orders/${order.id}/invoice`} 
                        className={styles.actionBtn}
                      >
                        <FileText size={14} /> View Invoice
                      </Link>

                      <Link 
                        href={`/account/orders/${order.id}`} 
                        className={`${styles.actionBtn} ${styles.primaryBtn}`}
                      >
                        <span>View Order Details</span>
                        <ChevronRight size={14} />
                      </Link>
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
          </div>

          {/* Right VIP Snapshot */}
          <aside className={styles.statsPanel}>
            <div className={styles.vipCardHeader}>
              <span className={styles.vipCardTitle}>KICKAT REWARDS</span>
              <span className={styles.vipTierTag}>{userData.tier}</span>
            </div>
            <div className={styles.rewardsProgressBlock}>
              <div className={styles.pointsDisplayRow}>
                <span className={styles.pointsValue}>{userData.points.toLocaleString()}</span>
                <span className={styles.pointsLabel}>Available Paws</span>
              </div>
              <div className={styles.tierProgressBarWrapper}>
                <div className={styles.tierProgressBarFill} style={{ width: '62%' }}></div>
              </div>
              <div className={styles.tierProgressText}>
                <span>620 pts earned</span>
                <span>260 pts to Platinum</span>
              </div>
            </div>
          </aside>

        </div>
      </main>
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
