"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, MessageSquare, Star, Navigation, Clock, PackageCheck, AlertCircle, Truck, FileText } from 'lucide-react';
import styles from './Tracking.module.css';
import { orderService } from '@/services/orderService';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export default function LiveTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [tracking, setTracking] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTracking() {
      if (!orderId) return;
      document.title = `Track Order #${orderId} | KickAt`;
      setLoading(true);
      setError(null);
      try {
        const [trackRes, liveRes] = await Promise.allSettled([
          orderService.getOrderTracking(orderId),
          orderService.getOrderTrackingLive(orderId),
        ]);

        if (trackRes.status === 'fulfilled' && trackRes.value.success) {
          setTracking(trackRes.value.tracking || trackRes.value);
        }

        if (liveRes.status === 'fulfilled' && liveRes.value.success) {
          setLiveData(liveRes.value);
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

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Skeleton style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
            <div>
              <Skeleton style={{ width: '180px', height: '28px', borderRadius: '6px', marginBottom: '6px' }} />
              <Skeleton style={{ width: '120px', height: '18px', borderRadius: '4px' }} />
            </div>
          </div>
          <Skeleton style={{ width: '100%', height: '110px', borderRadius: '16px', marginBottom: '1.5rem' }} />
          <Skeleton style={{ width: '100%', height: '300px', borderRadius: '16px' }} />
        </div>
      </main>
    );
  }

  const rawStatus = (tracking?.status || 'SHIPPED').toUpperCase();

  const milestones = tracking?.milestones || [
    { 
      title: 'Order Confirmed', 
      description: 'Order placed and payment verified', 
      done: true, 
      time: tracking?.createdAt ? new Date(tracking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Confirmed' 
    },
    { 
      title: 'Packed & Dispatched', 
      description: 'Dispatched from KickAt central fulfillment center', 
      done: ['PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(rawStatus), 
      time: tracking?.dispatchedAt ? new Date(tracking.dispatchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'In Progress' 
    },
    { 
      title: 'In Transit / Out for Delivery', 
      description: 'Courier agent is en route to destination hub', 
      done: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(rawStatus), 
      time: tracking?.outForDeliveryAt ? new Date(tracking.outForDeliveryAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Active' 
    },
    { 
      title: 'Delivered', 
      description: 'Package delivered to recipient', 
      done: rawStatus === 'DELIVERED', 
      time: tracking?.estimatedDelivery ? `Est: ${new Date(tracking.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Expected Soon' 
    },
  ];

  const courierName = tracking?.courierPartner || tracking?.courierName || 'KickAt Express Logistics';
  const trackingNumber = tracking?.trackingNumber || tracking?.awbNumber;
  const deliveryAgent = liveData?.agent || null;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href={`/orders/${orderId}`} className={styles.backBtn} title="Back to Order">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className={styles.title}>Live Tracking</h1>
            <div style={{ color: '#78746D', fontSize: '0.9rem', fontWeight: 500 }}>
              Order #{orderId?.slice(0, 12).toUpperCase() || orderId}
              {trackingNumber && ` • Tracking: ${trackingNumber}`}
            </div>
          </div>
        </div>

        {/* Live Delivery Status Card */}
        <div className={styles.deliveryInfoCard}>
          <div className={styles.driverInfo}>
            <div className={styles.driverAvatar}>
              <Truck size={22} color="#F28C0F" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1A1612', fontSize: '1rem' }}>{courierName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: rawStatus === 'DELIVERED' ? '#16A34A' : '#2563EB' 
                }} />
                <span style={{ fontWeight: 600 }}>Status:</span> {rawStatus.replace(/_/g, ' ')}
                {deliveryAgent && ` • Agent: ${deliveryAgent.name}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link 
              href={`/orders/${orderId}`} 
              style={{ 
                padding: '0.55rem 1.1rem', 
                background: '#1A1612', 
                color: '#FFFFFF', 
                borderRadius: '10px', 
                textDecoration: 'none', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} />
              <span>Order Details</span>
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timelineCard}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1A1612' }}>
            Delivery Milestones
          </h2>
          
          <div className={styles.timeline}>
            {milestones.map((step: any, idx: number) => (
              <div key={idx} className={`${styles.timelineStep} ${step.done ? styles.completed : ''}`}>
                <div className={styles.timelineDot}>{step.done ? '✓' : ''}</div>
                <div className={styles.timelineTitle}>{step.title}</div>
                <div className={styles.timelineDesc}>{step.description} • <span style={{ fontWeight: 600 }}>{step.time}</span></div>
              </div>
            ))}
          </div>

          {tracking?.history && Array.isArray(tracking.history) && tracking.history.length > 0 && (
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid #EFE7DA', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1A1612' }}>
                Activity Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tracking.history.map((log: any, i: number) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      background: '#FAF7F2', 
                      padding: '10px 14px', 
                      borderRadius: '10px',
                      fontSize: '0.825rem',
                      color: '#555' 
                    }}
                  >
                    <span><strong>{log.status}</strong> - {log.location || 'Hub'}</span>
                    <span style={{ color: '#888' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
