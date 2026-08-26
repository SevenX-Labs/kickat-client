"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Home, User, Download, CheckCircle2, ChevronRight as ChevronRightIcon } from 'lucide-react';
import styles from './OrderDetails.module.css';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Mock Data for demonstration
  const orderId = params.id;
  
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} strokeWidth={2} style={{ display: 'inline', margin: '0 4px', position: 'relative', top: '1px' }} />
          <Link href="/account">My Account</Link>
          <ChevronRight size={12} strokeWidth={2} style={{ display: 'inline', margin: '0 4px', position: 'relative', top: '1px' }} />
          <Link href="/orders">My Orders</Link>
          <ChevronRight size={12} strokeWidth={2} style={{ display: 'inline', margin: '0 4px', position: 'relative', top: '1px' }} />
          <span style={{ color: '#212121', fontWeight: 500 }}>{orderId}</span>
        </div>

        <div className={styles.layout}>
          
          {/* LEFT COLUMN */}
          <div className={styles.leftColumn}>
            
            <div className={styles.box}>
              <div className={styles.headerRow}>
                <span>Manage who can access</span>
                <ChevronRightIcon size={18} color="#878787" />
              </div>
              
              <div className={styles.productRow}>
                <div className={styles.productInfo}>
                  <div className={styles.productTitle}>Ceramic Anti-Slip Pet Bowl</div>
                  <div className={styles.productMeta}>Color: Matte White</div>
                  <div className={styles.productMeta}>Seller: KickAt Official</div>
                  
                  <div className={styles.priceBlock}>
                    <span className={styles.price}>₹1,499</span>
                    <span className={styles.offerText}>2 Offers Applied</span>
                  </div>
                </div>
                
                <div className={styles.productImageWrapper}>
                  <Image 
                    src="/hero-products/pet_bowl.png" 
                    alt="Pet Bowl" 
                    fill 
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>

              <div className={styles.trackingSection}>
                <ul className={styles.timeline}>
                  <li className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${styles.completed}`}></div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTitle}>Order Confirmed, Mon Aug 24</div>
                    </div>
                  </li>
                  
                  <li className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${styles.active}`}></div>
                    <div className={styles.timelineContent}>
                      <div className={styles.activeBackground}>
                        <div className={styles.timelineTitle}>Shipped</div>
                        <div className={styles.timelineSub}>Shipment has reached the hub nearest to you, MUMBAI, Wed 26th Aug</div>
                      </div>
                    </div>
                  </li>
                  
                  <li className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      <div className={`${styles.timelineTitle} ${styles.muted}`}>Out For Delivery</div>
                    </div>
                  </li>
                  
                  <li className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      <div className={`${styles.timelineTitle} ${styles.muted}`}>Delivery, Today By 11 PM</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fbff', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ color: '#2874f0', fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>See All Updates &gt;</div>
                <div style={{ background: '#ffffff', border: '1px solid #a3c4f9', borderRadius: '4px', padding: '1rem', fontSize: '0.9rem', color: '#212121' }}>
                  Your order is on track to reach you by 11 pm today.
                </div>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>
            
            {/* Delivery Details */}
            <div className={styles.box}>
              <div className={styles.sectionTitle}>Delivery details</div>
              <div className={styles.addressContent}>
                <div className={styles.addressRow}>
                  <Home size={18} color="#878787" style={{ marginTop: '2px' }} />
                  <div>
                    <div className={styles.addressName}>Home</div>
                    <div className={styles.addressText}>123 Pet Lover Lane, Block B, Near Park, Mumbai, 400001</div>
                  </div>
                </div>
                <div className={styles.addressRow}>
                  <User size={18} color="#878787" style={{ marginTop: '2px' }} />
                  <div>
                    <div className={styles.addressName}>Sarah Jenkins</div>
                    <div className={styles.addressText}>+91 98765 43210</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className={styles.box}>
              <div className={styles.sectionTitle}>Price details</div>
              <div className={styles.priceTable}>
                <div className={styles.priceRow}>
                  <span>Listing price</span>
                  <span>₹2,499</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Special price</span>
                  <span>₹1,599</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Total fees</span>
                  <span>₹50</span>
                </div>
                <div className={`${styles.priceRow} ${styles.discount}`}>
                  <span>Other discount</span>
                  <span className={styles.value}>-₹150</span>
                </div>
              </div>
              
              <div className={styles.priceTotal}>
                <span>Total amount</span>
                <span>₹1,499</span>
              </div>
              
              <div className={styles.paidBy}>
                <span>Paid By</span>
                <span style={{ fontWeight: 600, border: '1px solid #e0e0e0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>UPI</span>
              </div>
              
              <button className={styles.downloadBtn}>
                <Download size={18} />
                Download Invoice
              </button>
            </div>

            {/* Offers */}
            <div className={styles.box}>
              <div className={styles.sectionTitle} style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 24, height: 24, background: '#f1f3f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏆</div>
                  Offers earned
                </div>
                <ChevronRightIcon size={18} color="#878787" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
