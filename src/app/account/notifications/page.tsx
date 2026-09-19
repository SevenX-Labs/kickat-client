"use client";

import { useState, Suspense } from 'react';
import { Bell, Package, Tag, Info, Trash2, CheckCircle2 } from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

function NotificationsContent() {
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, type: 'order', title: 'Order Delivered', message: 'Your order ORD-89241 has been delivered.', time: '2 hours ago', isRead: false },
    { id: 2, type: 'promo', title: 'Flash Sale! 20% Off', message: 'Use code PAWS20 for 20% off all dog accessories today only.', time: 'Yesterday', isRead: false },
    { id: 3, type: 'system', title: 'Password Changed', message: 'Your account password was updated successfully.', time: '3 days ago', isRead: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  const getIcon = (type: string) => {
    if (type === 'order') return <Package size={16} className={styles.notifIconOrder} />;
    if (type === 'promo') return <Tag size={16} className={styles.notifIconPromo} />;
    return <Info size={16} className={styles.notifIconSystem} />;
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.isRead;
    return true;
  });

  return (
    <div className={styles.contentArea}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageH1}>Notifications</h1>
          <p className={styles.pageSubtitle}>Stay updated on your orders and exclusive offers</p>
        </div>
        <div className={styles.wishlistActions}>
          <Button variant="ghost" onClick={markAllRead} disabled={unreadCount === 0} icon={<CheckCircle2 size={16} />}>
            Mark all as read
          </Button>
          <Button variant="danger" onClick={clearAll} disabled={notifications.length === 0} icon={<Trash2 size={16} />}>
            Clear all
          </Button>
        </div>
      </div>

      <div className={styles.ordersToolbar}>
        <div className={styles.statusChips}>
          <button className={`${styles.chip} ${filter === 'All' ? styles.chipActive : ''}`} onClick={() => setFilter('All')}>
            All ({notifications.length})
          </button>
          <button className={`${styles.chip} ${filter === 'Unread' ? styles.chipActive : ''}`} onClick={() => setFilter('Unread')}>
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.notifList}>
          <Skeleton style={{ height: 80 }} />
          <Skeleton style={{ height: 80 }} />
        </div>
      ) : filtered.length > 0 ? (
        <div className={styles.notifList}>
          {filtered.map(notif => (
            <div key={notif.id} className={`${styles.notifCard} ${notif.isRead ? styles.notifRead : ''}`}>
              <div className={styles.notifIconWrap}>
                {getIcon(notif.type)}
              </div>
              <div className={styles.notifBody}>
                <div className={styles.notifTitleRow}>
                  <h4 className={styles.notifTitle}>{notif.title}</h4>
                  <span className={styles.notifTime}>{notif.time}</span>
                </div>
                <p className={styles.notifMessage}>{notif.message}</p>
              </div>
              {!notif.isRead && <div className={styles.unreadDot} />}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<Bell size={48} />}
          title="No notifications yet"
          description="We'll notify you when there's an update on your orders or account."
        />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <NotificationsContent />
    </Suspense>
  );
}
