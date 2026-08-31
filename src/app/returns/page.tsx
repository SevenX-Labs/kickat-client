"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, RefreshCw, CheckCircle2 } from 'lucide-react';
import styles from './Returns.module.css';

const mockReturns = [
  {
    id: 'RET-99214',
    orderId: 'ORD-89241',
    date: 'August 28, 2026',
    status: 'Processing',
    item: {
      name: 'Ceramic Anti-Slip Pet Bowl',
      image: '/hero-products/pet_bowl.png',
    },
    refundAmount: 1499,
  },
  {
    id: 'RET-88102',
    orderId: 'ORD-77123',
    date: 'July 15, 2026',
    status: 'Completed',
    item: {
      name: 'Premium Leather Dog Collar',
      image: '/hero-products/pet_bowl.png', // Fallback dummy image
    },
    refundAmount: 899,
  }
];

export default function ReturnsDashboard() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <ChevronRight size={14} style={{ margin: '0 4px' }} />
          <Link href="/account">My Account</Link>
          <ChevronRight size={14} style={{ margin: '0 4px' }} />
          <span style={{ color: '#111', fontWeight: 500 }}>Returns</span>
        </div>

        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Returns & Refunds</h1>
          <p className={styles.pageSubtitle}>Track the status of your return requests and refunds.</p>
        </header>

        <div className={styles.returnsList}>
          {mockReturns.map((ret) => (
            <div key={ret.id} className={styles.returnCard}>
              <div className={styles.returnInfo}>
                <div className={styles.itemImageWrapper}>
                  <Image src={ret.item.image} alt={ret.item.name} fill style={{ objectFit: 'contain', padding: '0.5rem' }} />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{ret.item.name}</div>
                  <div className={styles.returnId}>Return ID: {ret.id} • Order: {ret.orderId}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {ret.status === 'Processing' ? (
                      <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>
                        <RefreshCw size={14} /> Processing
                      </span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                        <CheckCircle2 size={14} /> Refunded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Refund Amount</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{ret.refundAmount.toLocaleString()}</div>
                </div>
                <Link href={`/returns/${ret.id}`} className={styles.actionBtn}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
