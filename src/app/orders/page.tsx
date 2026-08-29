"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronRight, Package, ArrowRight } from 'lucide-react';
import styles from './Orders.module.css';

// Mock Data
const orders = [
  {
    id: 'ORD-89241',
    date: 'Aug 15, 2026',
    total: 1499,
    status: 'Delivered',
    statusDate: 'Aug 18, 2026',
    statusSubtext: 'Your package was handed to a resident.',
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
    statusSubtext: 'Your item has been received in the hub nearest to you and is being prepared for dispatch.',
    items: [
      { name: 'Premium Leather Dog Collar', variant: 'Brown / Large', image: '/hero-products/dog_food.png' }
    ]
  },
  {
    id: 'ORD-87004',
    date: 'July 15, 2026',
    total: 450,
    status: 'Cancelled',
    statusDate: 'July 16, 2026',
    statusSubtext: 'Your order was cancelled as per your request. The refund has been credited to your original payment method.',
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
                <input type="checkbox" className={styles.checkboxInput} defaultChecked />
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
                <input type="checkbox" className={styles.checkboxInput} defaultChecked />
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
                <Search size={20} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search by order ID, product, or tracking number" 
              />
            </div>

            {/* Orders List */}
            <div className={styles.ordersList}>
              {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  
                  {/* Order Header */}
                  <div className={styles.orderHeader}>
                    <div className={styles.orderMeta}>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Order Placed</span>
                        <span className={styles.metaValue}>{order.date}</span>
                      </div>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Total</span>
                        <span className={styles.metaValue}>₹{order.total.toLocaleString()}</span>
                      </div>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Order #</span>
                        <span className={styles.metaValue} style={{ color: '#E7A03B' }}>{order.id}</span>
                      </div>
                    </div>
                    
                    <button className={styles.orderActionBtn}>
                      View Invoice
                    </button>
                  </div>

                  {/* Order Content */}
                  <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className={styles.orderContent}>
                      
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
                      
                      <div className={styles.statusSection}>
                        <div className={styles.statusTop}>
                          <span className={`${styles.statusBadge} ${
                            order.status === 'Delivered' ? styles.green : 
                            order.status === 'Processing' ? styles.orange : 
                            styles.red
                          }`}>
                            {order.status}
                          </span>
                          <span className={styles.statusDate}>{order.statusDate}</span>
                        </div>
                        <div className={styles.statusSubtext}>
                          {order.statusSubtext}
                        </div>
                        
                        {order.status === 'Cancelled' ? (
                          <div className={styles.actionLink}>
                            Repurchase Item <ArrowRight size={14} />
                          </div>
                        ) : order.status === 'Processing' ? (
                          <div className={styles.actionLink}>
                            Track Package <ArrowRight size={14} />
                          </div>
                        ) : (
                          <div className={styles.actionLink}>
                            ★ Rate & Review Product
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                </div>
              ))}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
