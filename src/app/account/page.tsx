"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, User, MapPin, Heart, LogOut, CheckCircle2, Clock } from 'lucide-react';
import styles from './Account.module.css';

// Mock Data
const user = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
};

const orders = [
  {
    id: '#ORD-89241',
    date: 'August 18, 2026',
    total: 1499,
    status: 'Delivered',
    items: [
      { name: 'Precision Digital Thermostat Submersible Heater 200W', variant: '200W', image: '/hero-products/fish_aquarium.png' }
    ]
  },
  {
    id: '#ORD-88102',
    date: 'August 02, 2026',
    total: 2697,
    status: 'Processing',
    items: [
      { name: 'Premium Leather Dog Collar', variant: 'Brown / Large', image: '/hero-products/dog_food.png' },
      { name: 'Organic Cat Treats', variant: 'Salmon Flavor', image: '/hero-products/cat_treats.png' }
    ]
  }
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
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
              <Package size={20} /> My Orders
            </a>
            <a 
              className={`${styles.navLink} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} /> Profile Details
            </a>
            <a 
              className={`${styles.navLink} ${activeTab === 'addresses' ? styles.active : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={20} /> Saved Addresses
            </a>
            <a 
              className={`${styles.navLink} ${activeTab === 'wishlist' ? styles.active : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Heart size={20} /> Wishlist
            </a>
            
            <button className={styles.logoutBtn}>
              <LogOut size={20} /> Sign Out
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
              
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Order Placed</span>
                          <span className={styles.metaValue}>{order.date}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Total Amount</span>
                          <span className={styles.metaValue}>₹{order.total.toLocaleString()}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Order #</span>
                          <span className={styles.metaValue}>{order.id}</span>
                        </div>
                      </div>
                      
                      <div className={styles.orderStatus}>
                        <span className={`${styles.statusBadge} ${order.status === 'Processing' ? styles.processing : ''}`}>
                          {order.status === 'Delivered' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
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
                      <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>Track Order</button>
                    </div>
                  </div>
                ))}
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
      </div>
    </main>
  );
}
