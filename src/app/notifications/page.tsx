"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Package, Tag, Info } from 'lucide-react';
import styles from './Notifications.module.css';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD-89241 has been delivered successfully. Let us know how you liked it!',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    type: 'promo',
    title: 'Special 20% Off Weekend Sale!',
    message: 'Use code PAW20 at checkout for 20% off all pet accessories.',
    time: '1 day ago',
    unread: true,
  },
  {
    id: 3,
    type: 'system',
    title: 'Welcome to KickAt',
    message: 'Thank you for creating an account with us. Start exploring the best for your pet!',
    time: '3 days ago',
    unread: false,
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" style={{ color: '#111' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className={styles.title}>
            <Bell size={24} /> Notifications
          </h1>
          {unreadCount > 0 ? (
            <button className={styles.markReadBtn} onClick={markAllRead}>
              Mark all read
            </button>
          ) : (
            <div style={{ width: '80px' }} /> /* Spacer for centering */
          )}
        </div>

        {notifications.length > 0 ? (
          <div className={styles.list}>
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`${styles.card} ${notif.unread ? styles.unread : ''}`}
                onClick={() => markAsRead(notif.id)}
                style={{ cursor: notif.unread ? 'pointer' : 'default' }}
              >
                {notif.unread && <div className={styles.unreadDot} />}
                
                <div className={`${styles.iconWrapper} ${styles[notif.type]}`}>
                  {notif.type === 'order' && <Package size={20} />}
                  {notif.type === 'promo' && <Tag size={20} />}
                  {notif.type === 'system' && <Info size={20} />}
                </div>

                <div className={styles.content}>
                  <div className={styles.notifTitle}>{notif.title}</div>
                  <div className={styles.notifText}>{notif.message}</div>
                  <div className={styles.notifTime}>{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Bell size={28} />
            </div>
            <div className={styles.emptyTitle}>You're all caught up!</div>
            <div className={styles.emptyText}>No new notifications at the moment.</div>
          </div>
        )}
      </div>
    </main>
  );
}
