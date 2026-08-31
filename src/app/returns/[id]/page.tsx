"use client";

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, CreditCard, ArrowLeft } from 'lucide-react';
import styles from '../Returns.module.css';

export default function ReturnDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const returnId = resolvedParams.id || "RET-99214";
  
  // Dummy data based on the ID
  const isCompleted = returnId === 'RET-88102';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/returns" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={14} /> Back to Returns
          </Link>
        </div>

        <header className={styles.pageHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className={styles.pageTitle}>Return #{returnId}</h1>
              <p className={styles.pageSubtitle}>For Order #ORD-89241 • Requested on August 28, 2026</p>
            </div>
            {isCompleted ? (
              <span className={`${styles.statusBadge} ${styles.statusCompleted}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Refunded</span>
            ) : (
              <span className={`${styles.statusBadge} ${styles.statusProcessing}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>In Transit</span>
            )}
          </div>
        </header>

        <div className={styles.detailGrid}>
          
          {/* Left Column: Timeline & Item */}
          <div>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Returned Item</h2>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div className={styles.itemImageWrapper}>
                  <Image src="/hero-products/pet_bowl.png" alt="Pet Bowl" fill style={{ objectFit: 'contain', padding: '0.5rem' }} />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>Ceramic Anti-Slip Pet Bowl</div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>Reason: Defective/Damaged item</div>
                  <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>₹1,499</div>
                </div>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Return Status Tracker</h2>
              <div className={styles.timeline}>
                
                <div className={`${styles.timelineStep} ${styles.completed}`}>
                  <div className={styles.timelineDot}>✓</div>
                  <div className={styles.timelineTitle}>Return Requested</div>
                  <div className={styles.timelineDesc}>Your return request was approved.</div>
                  <div className={styles.timelineDate}>Aug 28, 2026, 10:30 AM</div>
                </div>

                <div className={`${styles.timelineStep} ${styles.completed}`}>
                  <div className={styles.timelineDot}>✓</div>
                  <div className={styles.timelineTitle}>Pickup Scheduled</div>
                  <div className={styles.timelineDesc}>Package was picked up by our courier partner.</div>
                  <div className={styles.timelineDate}>Aug 29, 2026, 2:15 PM</div>
                </div>

                <div className={`${styles.timelineStep} ${isCompleted ? styles.completed : styles.active}`}>
                  <div className={styles.timelineDot}>{isCompleted ? '✓' : ''}</div>
                  <div className={styles.timelineTitle}>In Transit to Warehouse</div>
                  <div className={styles.timelineDesc}>Package is on the way to our quality check facility.</div>
                  <div className={styles.timelineDate}>{isCompleted ? 'Aug 30, 2026' : 'Expected: Aug 31, 2026'}</div>
                </div>

                <div className={`${styles.timelineStep} ${isCompleted ? styles.completed : ''}`}>
                  <div className={styles.timelineDot}>{isCompleted ? '✓' : ''}</div>
                  <div className={styles.timelineTitle}>Quality Check & Refund</div>
                  <div className={styles.timelineDesc}>Refund will be initiated to original payment method.</div>
                  <div className={styles.timelineDate}>{isCompleted ? 'Refund Processed successfully' : 'Pending'}</div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Refund Summary */}
          <div>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Refund Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Refund Amount</span>
                <span style={{ color: '#111', fontWeight: 500 }}>₹1,499</span>
              </div>
              
              <div className={styles.summaryRow} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#111' }}>Refund Destination</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fcfcfc', border: '1px solid #eee', padding: '1rem', borderRadius: '12px' }}>
                <CreditCard size={20} color="#666" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#111' }}>Original Payment Method</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>UPI • xxxxxx@ybl</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(231, 160, 59, 0.08)', borderRadius: '12px', fontSize: '0.85rem', color: '#b77a25', lineHeight: 1.5 }}>
                {isCompleted ? (
                  "The refund has been successfully credited to your account."
                ) : (
                  "Refunds typically take 3-5 business days to reflect in your account after the quality check is passed."
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
