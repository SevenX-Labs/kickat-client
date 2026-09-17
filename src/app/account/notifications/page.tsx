"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  Bell, CheckCircle2, Truck, Tag, CreditCard, ArrowLeft, 
  CheckCheck, PackageCheck, AlertCircle 
} from 'lucide-react';
import styles from '../Account.module.css';
import notifStyles from './Notifications.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';
import { useAuth } from '@/context/AuthContext';

interface NotificationItem {
  id: string;
  category: 'orders' | 'delivery' | 'payments' | 'offers';
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'delivery',
    title: 'Order Delivered',
    message: 'Your order #ORD-849201 (Ceramic Anti-Slip Pet Bowl) has been delivered.',
    time: 'Today · 2:30 PM',
    read: false,
    orderId: 'ORD-849201',
  },
  {
    id: 'n2',
    category: 'orders',
    title: 'Order Shipped',
    message: 'Package dispatched via BlueDart Express. Tracking ID: #BD8849201.',
    time: 'Yesterday · 11:15 AM',
    read: false,
    orderId: 'ORD-849201',
  },
  {
    id: 'n3',
    category: 'payments',
    title: 'Payment Successful',
    message: 'Payment of ₹1,499 confirmed for Order #ORD-849201 via UPI.',
    time: 'Aug 24, 2026 · 6:45 PM',
    read: true,
    orderId: 'ORD-849201',
  },
  {
    id: 'n4',
    category: 'offers',
    title: 'Exclusive VIP Offer Unlocked',
    message: 'You earned 1,240 KickAt Paws! Get ₹200 OFF on your next pet food order.',
    time: 'Aug 20, 2026 · 10:00 AM',
    read: true,
  }
];

function NotificationsContent() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const userData = {
    firstName: user?.name?.split(' ')[0] || "KickAt",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "Member",
    email: user?.email || "member@kickat.co.in",
    tier: "Gold Paw VIP",
    points: 1240
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'delivery': return <Truck size={16} color="#F99205" />;
      case 'orders': return <PackageCheck size={16} color="#3B82F6" />;
      case 'payments': return <CreditCard size={16} color="#10B981" />;
      case 'offers': return <Tag size={16} color="#8B5CF6" />;
      default: return <Bell size={16} color="#F99205" />;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <div className={styles.accountLayout}>
          
          {/* Account Sidebar Nav */}
          <div className={styles.subpageSidebarWrapper}>
            <AccountSidebarNav user={userData} />
          </div>

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.backHeaderGroup}>
              <Link href="/account" className={styles.backToAccountBtn}>
                <ArrowLeft size={18} />
                <span>Back to Account</span>
              </Link>
            </div>

            <div className={styles.tabContentCard}>
              <div className={notifStyles.headerRow}>
                <div>
                  <h1 className={styles.title}>Notifications</h1>
                  <p className={styles.subtitle}>Stay updated about your orders and account.</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    type="button" 
                    className={notifStyles.markReadBtn}
                    onClick={markAllAsRead}
                  >
                    <CheckCheck size={15} />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className={notifStyles.categoryFilterRow}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'orders', label: 'Order Updates' },
                  { id: 'delivery', label: 'Delivery Updates' },
                  { id: 'payments', label: 'Payment Updates' },
                  { id: 'offers', label: 'Offers & Perks' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${notifStyles.filterPill} ${activeCategory === cat.id ? notifStyles.filterPillActive : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              {filteredNotifications.length > 0 ? (
                <div className={notifStyles.notifList}>
                  {filteredNotifications.map((item) => (
                    <div 
                      key={item.id} 
                      className={`${notifStyles.notifItem} ${!item.read ? notifStyles.unreadItem : ''}`}
                      onClick={() => markSingleAsRead(item.id)}
                    >
                      <div className={notifStyles.iconBadge}>
                        {getCategoryIcon(item.category)}
                      </div>
                      
                      <div className={notifStyles.notifContent}>
                        <div className={notifStyles.titleRow}>
                          <span className={notifStyles.itemTitle}>{item.title}</span>
                          {!item.read && <span className={notifStyles.unreadDot} />}
                        </div>
                        <p className={notifStyles.itemMessage}>{item.message}</p>
                        <span className={notifStyles.itemTime}>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={notifStyles.emptyState}>
                  <div className={notifStyles.emptyIconCircle}>
                    <CheckCircle2 size={32} color="#15803D" />
                  </div>
                  <h3 className={notifStyles.emptyTitle}>You&apos;re all caught up!</h3>
                  <p className={notifStyles.emptySub}>No new notifications right now in this category.</p>
                </div>
              )}

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

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading notifications...</div>}>
      <NotificationsContent />
    </Suspense>
  );
}
