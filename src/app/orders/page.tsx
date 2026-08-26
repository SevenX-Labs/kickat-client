"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import styles from './Orders.module.css';

// Mock Data
const orders = [
  {
    id: 'ORD-89241',
    date: 'Aug 15',
    total: 1499,
    status: 'Delivered',
    statusDate: 'Aug 18',
    statusSubtext: 'Your item has been delivered',
    items: [
      { name: 'Ceramic Anti-Slip Pet Bowl', variant: 'Matte White', image: '/hero-products/pet_bowl.png' }
    ]
  },
  {
    id: 'ORD-88102',
    date: 'Aug 02',
    total: 2697,
    status: 'Processing',
    statusDate: 'Arriving by Aug 22',
    statusSubtext: 'Your item has been received in the hub nearest to you',
    items: [
      { name: 'Premium Leather Dog Collar', variant: 'Brown / Large', image: '/hero-products/dog_food.png' }
    ]
  },
  {
    id: 'ORD-87004',
    date: 'July 15',
    total: 450,
    status: 'Cancelled',
    statusDate: 'July 16',
    statusSubtext: 'Your order was cancelled as per your request.',
    items: [
      { name: 'Interactive Cat Toy', variant: 'Blue Feather', image: '/hero-products/cat_treats.png' }
    ]
  }
];

export default function OrdersPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} strokeWidth={2} style={{ display: 'inline', margin: '0 4px', position: 'relative', top: '1px' }} />
          <Link href="/account">My Account</Link>
          <ChevronRight size={12} strokeWidth={2} style={{ display: 'inline', margin: '0 4px', position: 'relative', top: '1px' }} />
          <span style={{ color: '#212121', fontWeight: 500 }}>My Orders</span>
        </div>

        <div className={styles.layout}>
          
          {/* Left Sidebar Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Filters</div>
            
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>Order Status</div>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                On the way
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                Delivered
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                Cancelled
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                Returned
              </label>
            </div>
            
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>Order Time</div>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                Last 30 days
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                2026
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                2025
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkboxInput} />
                Older
              </label>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            
            {/* Search Bar */}
            <div className={styles.searchBarWrapper}>
              <div className={styles.searchIconWrapper}>
                <Search size={18} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search your orders here" 
              />
            </div>

            {/* Orders List */}
            <div className={styles.ordersList}>
              {orders.map(order => (
                <Link key={order.id} href={`/orders/${order.id}`} className={styles.orderCard}>
                
                <div className={styles.productImageWrapper}>
                  <Image 
                    src={order.items[0].image} 
                    alt={order.items[0].name} 
                    fill 
                    className={styles.productImage} 
                  />
                </div>
                
                <div className={styles.productInfo}>
                  <div className={styles.productTitle}>{order.items[0].name}</div>
                  <div className={styles.productVariant}>Variant: {order.items[0].variant}</div>
                </div>
                
                <div className={styles.productPrice}>
                  ₹{order.total.toLocaleString()}
                </div>
                
                <div className={styles.statusSection}>
                  <div className={styles.statusTop}>
                    <div className={`${styles.statusDot} ${order.status === 'Cancelled' ? styles.red : styles.green}`} />
                    {order.status === 'Delivered' ? `Delivered on ${order.statusDate}` : 
                     order.status === 'Cancelled' ? `Cancelled on ${order.statusDate}` : 
                     order.statusDate}
                  </div>
                  <div className={styles.statusSubtext}>
                    {order.statusSubtext}
                  </div>
                  
                  {order.status === 'Cancelled' && (
                    <div className={styles.actionLink}>
                      ★ Rate & Review Product
                    </div>
                  )}
                </div>
                </Link>
              ))}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
