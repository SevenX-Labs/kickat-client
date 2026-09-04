"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, User, MapPin, Heart, LogOut, CheckCircle2, Clock, Search, XCircle, ClipboardList, ClipboardCheck, Truck, PackageCheck, Check } from 'lucide-react';
import styles from './Account.module.css';

// Mock Data
const user = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  memberSince: '2025',
  totalOrders: 12,
  points: 1240
};

const orders = [
  {
    id: '#ORD-89241',
    date: 'August 18, 2026',
    total: 1499,
    status: 'Delivered',
    items: [
      { name: 'Ceramic Anti-Slip Pet Bowl', variant: 'Matte White', image: '/hero-products/pet_bowl.png' }
    ]
  },
  {
    id: '#ORD-88102',
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
    id: '#ORD-87004',
    date: 'July 15, 2026',
    total: 450,
    status: 'Cancelled',
    items: [
      { name: 'Interactive Cat Toy', variant: 'Blue Feather', image: '/hero-products/cat_treats.png' }
    ]
  }
];

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'orders';
  
  const [orderFilter, setOrderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: string) => {
    router.push(`/account?tab=${tab}`);
  };

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
        
        {/* Mobile Profile Header Banner */}
        <div className={styles.mobileProfileHeader}>
          <div className={styles.avatar}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div className={styles.greeting}>
            <span className={styles.greetingText}>Welcome back,</span>
            <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
            <span className={styles.userEmailText}>{user.email}</span>
          </div>
          <div className={styles.mobileStatsRow}>
            <div className={styles.mobileStatChip}>
              <span className={styles.chipVal}>{user.totalOrders}</span>
              <span className={styles.chipLbl}>Orders</span>
            </div>
            <div className={styles.mobileStatChip}>
              <span className={`${styles.chipVal} ${styles.statPoints}`}>{user.points}</span>
              <span className={styles.chipLbl}>Points</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tab Navigation */}
        <div className={styles.mobileTabNavStrip}>
          <button 
            className={`${styles.mobileTabBtn} ${activeTab === 'orders' ? styles.mobileTabActive : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <Package size={16} />
            <span>My Orders</span>
          </button>
          <button 
            className={`${styles.mobileTabBtn} ${activeTab === 'profile' ? styles.mobileTabActive : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={16} />
            <span>Profile</span>
          </button>
          <button 
            className={`${styles.mobileTabBtn} ${activeTab === 'addresses' ? styles.mobileTabActive : ''}`}
            onClick={() => handleTabChange('addresses')}
          >
            <MapPin size={16} />
            <span>Addresses</span>
          </button>
          <button 
            className={`${styles.mobileTabBtn} ${activeTab === 'wishlist' ? styles.mobileTabActive : ''}`}
            onClick={() => handleTabChange('wishlist')}
          >
            <Heart size={16} />
            <span>Wishlist</span>
          </button>
        </div>

        <div className={styles.accountLayout}>
          
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className={styles.greeting}>
                <span className={styles.greetingText}>Welcome back,</span>
                <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                <span className={styles.userEmailText}>{user.email}</span>
              </div>
            </div>
            
            <nav className={styles.navMenu}>
              <button 
                type="button"
                className={`${styles.navLink} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => handleTabChange('orders')}
              >
                <div className={styles.navIconWrapper}><Package size={18} strokeWidth={2} /></div>
                <span>My Orders</span>
                {activeTab === 'orders' && <div className={styles.activePillDot} />}
              </button>
              <button 
                type="button"
                className={`${styles.navLink} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                <div className={styles.navIconWrapper}><User size={18} strokeWidth={2} /></div>
                <span>Profile Details</span>
                {activeTab === 'profile' && <div className={styles.activePillDot} />}
              </button>
              <button 
                type="button"
                className={`${styles.navLink} ${activeTab === 'addresses' ? styles.active : ''}`}
                onClick={() => handleTabChange('addresses')}
              >
                <div className={styles.navIconWrapper}><MapPin size={18} strokeWidth={2} /></div>
                <span>Saved Addresses</span>
                {activeTab === 'addresses' && <div className={styles.activePillDot} />}
              </button>
              <button 
                type="button"
                className={`${styles.navLink} ${activeTab === 'wishlist' ? styles.active : ''}`}
                onClick={() => handleTabChange('wishlist')}
              >
                <div className={styles.navIconWrapper}><Heart size={18} strokeWidth={2} /></div>
                <span>Wishlist</span>
                {activeTab === 'wishlist' && <div className={styles.activePillDot} />}
              </button>
              
              <button 
                type="button" 
                className={styles.logoutBtn}
                onClick={() => router.push('/login')}
              >
                <LogOut size={18} strokeWidth={2} /> <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className={styles.contentArea}>
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.title}>Order History</h1>
                  <p className={styles.subtitle}>Check the status of recent orders, manage returns, and discover similar products.</p>
                </div>

                {/* Filter and Search */}
                <div className={styles.controlsBar}>
                  <div className={styles.filterTabs}>
                    {['All', 'Processing', 'Delivered', 'Cancelled'].map(tab => (
                      <button 
                        key={tab} 
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
                      placeholder="Search by order #" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
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
                            <span className={styles.metaLabel}>Total</span>
                            <span className={styles.metaValue}>₹{order.total.toLocaleString()}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Order #</span>
                            <span className={`${styles.metaValue} ${styles.mono}`}>{order.id}</span>
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
                        <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
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
                              <div className={styles.itemName}>{item.name}</div>
                              <div className={styles.itemVariant}>Variant: {item.variant}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className={styles.orderFooter}>
                        <button className={styles.actionBtn} onClick={() => router.push(`/orders/${order.id.replace('#', '')}/invoice`)}>
                          View Invoice
                        </button>
                        {order.status !== 'Cancelled' && (
                          <button 
                            className={`${styles.actionBtn} ${styles.primaryBtn}`}
                            onClick={() => router.push(`/orders/${order.id.replace('#', '')}`)}
                          >
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className={styles.emptyStateCard}>
                      <Package size={44} color="#FD802E" style={{ opacity: 0.5 }} />
                      <h3 className={styles.emptyStateTitle}>No Orders Found</h3>
                      <p className={styles.emptyStateDesc}>We couldn't find any orders matching your selected criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE DETAILS TAB */}
            {activeTab === 'profile' && (
              <div className={styles.tabContentCard}>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.title}>Profile Details</h1>
                  <p className={styles.subtitle}>Manage your personal information, contact details, and account security.</p>
                </div>

                <div className={styles.profileDetailsGrid}>
                  <div className={styles.detailFieldBlock}>
                    <span className={styles.fieldLabel}>Full Name</span>
                    <span className={styles.fieldValue}>{user.firstName} {user.lastName}</span>
                  </div>
                  <div className={styles.detailFieldBlock}>
                    <span className={styles.fieldLabel}>Email Address</span>
                    <span className={styles.fieldValue}>{user.email}</span>
                  </div>
                  <div className={styles.detailFieldBlock}>
                    <span className={styles.fieldLabel}>Phone Number</span>
                    <span className={styles.fieldValue}>+91 98765 43210</span>
                  </div>
                  <div className={styles.detailFieldBlock}>
                    <span className={styles.fieldLabel}>Member Since</span>
                    <span className={styles.fieldValue}>{user.memberSince}</span>
                  </div>
                  <div className={styles.detailFieldBlock}>
                    <span className={styles.fieldLabel}>Default Currency</span>
                    <span className={styles.fieldValue}>INR (₹)</span>
                  </div>
                  <div className={styles.detailFieldBlock}>
                    <span className={styles.fieldLabel}>Account Status</span>
                    <span className={styles.verifiedBadge}>
                      <CheckCircle2 size={13} /> Verified KickAt Member
                    </span>
                  </div>
                </div>

                <div className={styles.tabActionFooter}>
                  <button type="button" className={styles.primaryBtn}>Edit Information</button>
                  <button type="button" className={styles.actionBtn}>Change Password</button>
                </div>
              </div>
            )}

            {/* SAVED ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className={styles.tabContentCard}>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.title}>Saved Addresses</h1>
                  <p className={styles.subtitle}>Manage your shipping addresses for faster checkout.</p>
                </div>

                <div className={styles.addressesGrid}>
                  <div className={styles.addressCardActive}>
                    <div className={styles.addressHeaderRow}>
                      <span className={styles.addressTypeBadge}>Home</span>
                      <span className={styles.defaultPill}>Default</span>
                    </div>
                    <div className={styles.addressName}>Sarah Jenkins</div>
                    <p className={styles.addressText}>123 Pet Lover Lane, Block B, Near Park, Mumbai, Maharashtra, 400001</p>
                    <div className={styles.addressPhone}>Phone: +91 98765 43210</div>
                    <div className={styles.addressCardActions}>
                      <button type="button" className={styles.addressEditBtn}>Edit</button>
                      <button type="button" className={styles.addressRemoveBtn}>Remove</button>
                    </div>
                  </div>
                </div>

                <div className={styles.tabActionFooter}>
                  <button type="button" className={styles.primaryBtn}>+ Add New Address</button>
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className={styles.tabContentCard}>
                <div className={styles.sectionHeader}>
                  <h1 className={styles.title}>My Wishlist</h1>
                  <p className={styles.subtitle}>Items you saved for your furry companions.</p>
                </div>

                <div className={styles.emptyStateCard}>
                  <div className={styles.emptyIconCircle}>
                    <Heart size={32} color="#FD802E" />
                  </div>
                  <h3 className={styles.emptyStateTitle}>Your Wishlist is Empty</h3>
                  <p className={styles.emptyStateDesc}>Save items while browsing to track prices and buy them later.</p>
                  <button 
                    type="button" 
                    className={styles.primaryBtn} 
                    onClick={() => router.push('/category')}
                    style={{ marginTop: '1rem' }}
                  >
                    Explore Products
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Stats Panel */}
          <aside className={styles.statsPanel}>
            <h3 className={styles.statsTitle}>Account Snapshot</h3>
            <div className={styles.statBlock}>
              <div className={styles.statValue}>{user.totalOrders}</div>
              <div className={styles.statLabel}>Lifetime Orders</div>
            </div>
            <div className={styles.statBlock}>
              <div className={`${styles.statValue} ${styles.statPoints}`}>{user.points.toLocaleString()}</div>
              <div className={styles.statLabel}>KickAt Reward Points</div>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statValue} style={{ fontSize: '1.25rem', fontFamily: 'inherit', marginTop: '0.25rem' }}>
                {user.memberSince}
              </div>
              <div className={styles.statLabel}>Member Since</div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading account details...</div>}>
      <AccountContent />
    </Suspense>
  );
}
