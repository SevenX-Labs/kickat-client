"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, User, MapPin, Heart, LogOut, CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
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

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    if (orderFilter !== 'All' && order.status !== orderFilter) return false;
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={14} />;
      case 'Processing': return <Clock size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
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

  const renderProgressTracker = (progress: number) => {
    const steps = ['Placed', 'Packed', 'Shipped', 'Delivered'];
    const activeIndex = progress;

    return (
      <div className={styles.progressTracker}>
        <div className={styles.progressLine}></div>
        <div className={styles.progressLineActive} style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}></div>
        {steps.map((step, idx) => (
          <div key={idx} className={`${styles.progressStep} ${idx < activeIndex ? styles.completed : ''} ${idx === activeIndex ? styles.active : ''}`}>
            <div className={styles.stepDot}></div>
            <span className={styles.stepLabel}>{step}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
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
              </div>
            </div>
            
            <nav className={styles.navMenu}>
              <a 
                className={`${styles.navLink} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} strokeWidth={2} /> My Orders
              </a>
              <a 
                className={`${styles.navLink} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={20} strokeWidth={2} /> Profile Details
              </a>
              <a 
                className={`${styles.navLink} ${activeTab === 'addresses' ? styles.active : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={20} strokeWidth={2} /> Saved Addresses
              </a>
              <a 
                className={`${styles.navLink} ${activeTab === 'wishlist' ? styles.active : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={20} strokeWidth={2} /> Wishlist
              </a>
              
              <button className={styles.logoutBtn}>
                <LogOut size={18} strokeWidth={2} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className={styles.contentArea}>
            
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
                    <Search className={styles.searchIcon} size={16} />
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
                        <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
                          {renderProgressTracker(order.progress)}
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
                        <button className={styles.actionBtn}>View Invoice</button>
                        {order.status !== 'Cancelled' && (
                          <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>Track Order</button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '4rem 0', textAlign: 'center', color: '#888' }}>
                      <Package size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                      <p>No orders found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab !== 'orders' && (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#666' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>Coming Soon</h2>
                <p>The {activeTab} section is currently under development.</p>
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
              <div className={styles.statValue} style={{ fontSize: '1.25rem', fontFamily: 'inherit', marginTop: '0.5rem' }}>
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
