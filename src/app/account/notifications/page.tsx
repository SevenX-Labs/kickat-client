"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Bell, Package, Tag, Info, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import styles from '../Account.module.css';
import { Button } from '@/components/ui/Button';
import { notificationService, NotificationItem } from '@/services/notificationService';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await notificationService.getNotifications();
        if (res.success && res.items) {
          setNotifications(res.items);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('ORDER')) return <Package size={16} className={styles.notifIconOrder} />;
    if (t.includes('CAMPAIGN') || t.includes('PROMO')) return <Tag size={16} className={styles.notifIconPromo} />;
    return <Info size={16} className={styles.notifIconSystem} />;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    } catch {
      return dateString;
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('notifications-read'));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (notif.isRead) return;
    try {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new CustomEvent('notifications-read'));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const clearAll = () => {
    // API spec does not have a clear-all endpoint, so we just clear local state for UI purposes
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
            <div 
              key={notif.id} 
              className={`${styles.notifCard} ${notif.isRead ? styles.notifRead : ''}`}
              onClick={() => handleNotificationClick(notif)}
              style={{ cursor: notif.isRead ? 'default' : 'pointer' }}
            >
              <div className={styles.notifIconWrap}>
                {getIcon(notif.type)}
              </div>
              <div className={styles.notifBody}>
                <div className={styles.notifTitleRow}>
                  <h4 className={styles.notifTitle}>{notif.title}</h4>
                  <span className={styles.notifTime}>{formatTime(notif.createdAt)}</span>
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
