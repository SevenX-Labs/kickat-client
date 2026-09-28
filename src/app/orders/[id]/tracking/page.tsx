"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, MessageSquare, Star, Navigation, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import styles from './Tracking.module.css';
import { orderService } from '@/services/orderService';

export default function LiveTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTracking() {
      if (!orderId) return;
      setLoading(true);
      try {
        const res = await orderService.getOrderTracking(orderId);
        if (res && res.success && res.tracking) {
          setTracking(res.tracking);
        } else {
          setTracking(null);
        }
      } catch (err: any) {
        console.warn('Failed to fetch tracking data:', err);
        setError(err?.message || 'Could not load tracking details.');
      } finally {
        setLoading(false);
      }
    }
    loadTracking();
  }, [orderId]);

  const milestones = tracking?.milestones || [
    { title: 'Order Confirmed', description: 'Order logged into system', done: true, time: 'Confirmed' },
    { title: 'Packed & Dispatched', description: 'Warehouse handling completed', done: !!tracking?.dispatchedAt, time: tracking?.dispatchedAt ? new Date(tracking.dispatchedAt).toLocaleDateString() : 'Pending' },
    { title: 'In Transit', description: 'With courier partner', done: !!tracking?.outForDeliveryAt, time: tracking?.outForDeliveryAt ? new Date(tracking.outForDeliveryAt).toLocaleDateString() : 'Pending' },
    { title: 'Delivered', description: 'Package handed over', done: !!tracking?.deliveredAt, time: tracking?.deliveredAt ? new Date(tracking.deliveredAt).toLocaleDateString() : 'Expected Soon' },
  ];

  const courierName = tracking?.courierName || 'KickAt Express Logistics';
  const trackingNumber = tracking?.trackingNumber || tracking?.awbNumber;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href={`/orders/${orderId}`} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className={styles.title}>Live Tracking</h1>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Order #{orderId?.slice(0, 8).toUpperCase() || orderId}
              {trackingNumber && ` • AWB: ${trackingNumber}`}
            </div>
          </div>
        </div>

        {/* Live Delivery Status Card */}
        <div className={styles.deliveryInfoCard}>
          <div className={styles.driverInfo}>
            <div className={styles.driverAvatar}>
              <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>K</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#111' }}>{courierName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                <Star size={12} fill="#E7A03B" color="#E7A03B" /> Status: {tracking?.status || 'In Transit'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link 
              href={`/orders/${orderId}`} 
              style={{ padding: '0.5rem 1rem', background: '#111', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Order Details
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timelineCard}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111' }}>Delivery Milestones</h2>
          
          <div className={styles.timeline}>
            {milestones.map((step: any, idx: number) => (
              <div key={idx} className={`${styles.timelineStep} ${step.done ? styles.completed : ''}`}>
                <div className={styles.timelineDot}>{step.done ? '✓' : ''}</div>
                <div className={styles.timelineTitle}>{step.title}</div>
                <div className={styles.timelineDesc}>{step.description} • {step.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
