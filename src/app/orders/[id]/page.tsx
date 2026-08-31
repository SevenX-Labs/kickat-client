"use client";

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, MapPin, User, Download, Phone, Truck, HelpCircle, CheckCircle, Package } from 'lucide-react';
import styles from './OrderDetails.module.css';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id || "ORD-89241";
  
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
          <span style={{ color: '#211C15', fontWeight: 500 }}>{orderId}</span>
        </div>

        {/* HERO HEADER */}
        <header className={styles.heroHeader}>
          <div className={styles.headerTop}>
            <div className={styles.orderReference}>Order #{orderId}</div>
            <Link href="/support" className={styles.supportLink}>
              <HelpCircle size={16} /> Need help with this order?
            </Link>
          </div>
          <div className={styles.statusGroup}>
            <div className={styles.statusBadge} style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2E7D32' }}>
              <CheckCircle size={16} strokeWidth={2.5} />
              Delivered
            </div>
            <h1 className={styles.heroTitle}>Your order has been delivered.</h1>
            <p className={styles.heroSubtitle}>Delivered on August 27, 2026. Handed directly to a resident.</p>
          </div>
        </header>

        {/* PRODUCT CARD */}
        <div className={styles.productCard}>
          <div className={styles.productImageWrapper}>
            <Image 
              src="/hero-products/pet_bowl.png" 
              alt="Pet Bowl" 
              fill 
              style={{ objectFit: 'contain', padding: '0.5rem' }}
            />
          </div>
          
          <div className={styles.productInfo}>
            <h2 className={styles.productTitle}>Ceramic Anti-Slip Pet Bowl</h2>
            <div className={styles.productMeta}>Color: Matte White</div>
            <div className={styles.productMeta}>Seller: KickAt Official</div>
            
            <div className={styles.priceBlock}>
              <span className={styles.price}>₹1,499</span>
              <span className={styles.offerBadge}>2 Offers Applied</span>
            </div>
          </div>
          <div className={styles.productActions} style={{ display: 'flex', gap: '1rem' }}>
            <Link href={`/orders/${orderId}/tracking`} style={{ textDecoration: 'none', flex: 1 }}>
              <button className={styles.trackButton} style={{ width: '100%', backgroundColor: '#111', color: 'white', border: 'none' }}>
                Track Shipment
              </button>
            </Link>
            <Link href={`/orders/${orderId}/return`} style={{ textDecoration: 'none', flex: 1 }}>
              <button className={styles.trackButton} style={{ width: '100%', backgroundColor: '#fff', color: '#111', border: '1px solid #ddd' }}>
                Return Item
              </button>
            </Link>
          </div>
        </div>

        {/* HORIZONTAL TRACKER */}
        <section className={styles.trackerSection}>
          <h3 className={styles.trackerSectionTitle}>Tracking History</h3>
          <div className={styles.trackerContainer}>
            <div className={styles.trackerProgress} style={{ width: '100%' }}></div>
            
            <div className={`${styles.trackerStep} ${styles.completed}`}>
              <div className={styles.trackerDot}>✓</div>
              <div className={styles.trackerStepTitle}>Confirmed</div>
              <div className={styles.trackerStepDate}>Mon, Aug 24</div>
            </div>
            
            <div className={`${styles.trackerStep} ${styles.completed}`}>
              <div className={styles.trackerDot}>✓</div>
              <div className={styles.trackerStepTitle}>Shipped</div>
              <div className={styles.trackerStepDate}>Wed, Aug 26</div>
            </div>
            
            <div className={`${styles.trackerStep} ${styles.completed}`}>
              <div className={styles.trackerDot}>✓</div>
              <div className={styles.trackerStepTitle}>Out for Delivery</div>
              <div className={styles.trackerStepDate}>Thu, Aug 27</div>
            </div>
            
            <div className={`${styles.trackerStep} ${styles.completed}`}>
              <div className={styles.trackerDot}>✓</div>
              <div className={styles.trackerStepTitle}>Delivered</div>
              <div className={styles.trackerStepDate}>August 27, 2026</div>
            </div>
            
          </div>
        </section>

        {/* DETAILS GRID */}
        <section className={styles.detailsGrid}>
          
          {/* Left: Address */}
          <div className={styles.detailsSection}>
            <h3 className={styles.sectionTitle}>Delivery Details</h3>
            
            <div className={styles.infoRow}>
              <MapPin size={18} className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <div className={styles.infoName}>Home</div>
                <div className={styles.infoText}>123 Pet Lover Lane, Block B, Near Park, Mumbai, 400001</div>
              </div>
            </div>
            
            <div className={styles.infoRow}>
              <User size={18} className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <div className={styles.infoName}>Sarah Jenkins</div>
              </div>
            </div>
            
            <div className={styles.infoRow}>
              <Phone size={18} className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <div className={styles.infoText}>+91 98765 43210</div>
              </div>
            </div>
          </div>

          {/* Right: Price */}
          <div className={styles.detailsSection}>
            <h3 className={styles.sectionTitle}>Financial Summary</h3>
            
            <div className={styles.priceTable}>
              <div className={styles.priceRow}>
                <span>Listing price</span>
                <span>₹2,499</span>
              </div>
              <div className={styles.priceRow}>
                <span>Special price</span>
                <span>₹1,599</span>
              </div>
              <div className={`${styles.priceRow} ${styles.fees}`}>
                <span>Total fees</span>
                <span className={styles.value}>₹50</span>
              </div>
              <div className={`${styles.priceRow} ${styles.discount}`}>
                <span>Other discount</span>
                <span className={styles.value}>-₹150</span>
              </div>
            </div>
            
            <div className={styles.priceTotal}>
              <span>Total amount paid</span>
              <span>₹1,499</span>
            </div>
            <div className={styles.infoText} style={{ textAlign: 'right', marginTop: '-0.75rem', fontSize: '0.85rem' }}>
              Paid via UPI
            </div>
            
            <Link href={`/orders/${orderId}/invoice`} style={{ textDecoration: 'none' }}>
              <button className={styles.ghostButton} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#fafafa', border: '1px solid #eaeaea', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', color: '#111', fontWeight: 600 }}>
                <Download size={18} />
                View Invoice
              </button>
            </Link>
          </div>

        </section>

      </div>
    </div>
  );
}
