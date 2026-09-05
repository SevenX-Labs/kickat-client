"use client";

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, MessageSquare, Star, Navigation } from 'lucide-react';
import styles from '@/app/orders/[id]/tracking/Tracking.module.css';

export default function AccountOrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id || "ORD-89241";

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href={`/account/orders/${orderId}`} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className={styles.title}>Live Tracking</h1>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Order #{orderId}</div>
          </div>
        </div>

        {/* Dummy Map Area */}
        <div className={styles.mapContainer}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888', background: '#e5e7eb' }}>
            <Navigation size={48} color="#E7A03B" style={{ marginBottom: '1rem', animation: 'pulse 2s infinite' }} />
            <p>Live Map View (Simulated)</p>
            <p style={{ fontSize: '0.85rem' }}>Courier is 15 mins away</p>
          </div>
        </div>

        <div className={styles.deliveryInfoCard}>
          <div className={styles.driverInfo}>
            <div className={styles.driverAvatar}>
              <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>R</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#111' }}>Rahul K.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                <Star size={12} fill="#E7A03B" color="#E7A03B" /> 4.8 Delivery Partner
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fafafa', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MessageSquare size={18} color="#111" />
            </button>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Phone size={18} color="white" />
            </button>
          </div>
        </div>

        <div className={styles.timelineCard}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111' }}>Delivery Status</h2>
          
          <div className={styles.timeline}>
            <div className={`${styles.timelineStep} ${styles.completed}`}>
              <div className={styles.timelineDot}>✓</div>
              <div className={styles.timelineTitle}>Order Packed</div>
              <div className={styles.timelineDesc}>Warehouse • Aug 26, 10:00 AM</div>
            </div>
            <div className={`${styles.timelineStep} ${styles.completed}`}>
              <div className={styles.timelineDot}>✓</div>
              <div className={styles.timelineTitle}>Out for Delivery</div>
              <div className={styles.timelineDesc}>Mumbai Hub • Aug 27, 8:15 AM</div>
            </div>
            <div className={`${styles.timelineStep} ${styles.active}`}>
              <div className={styles.timelineDot}><MapPin size={12} /></div>
              <div className={styles.timelineTitle}>Arriving Soon</div>
              <div className={styles.timelineDesc}>Next stop: 123 Pet Lover Lane</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
