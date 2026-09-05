"use client";

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, MapPin, User, Download, Phone, Truck, CheckCircle, Package, RotateCcw, Clock, Navigation, PackageCheck, CheckCircle2, FileCheck, ArrowLeft } from 'lucide-react';
import styles from '@/app/orders/[id]/OrderDetails.module.css';

export default function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id || "ORD-89241";
  
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Navigation Back Link */}
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/account/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#78746D', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>

        {/* HERO / HEADER SECTION */}
        <div className={styles.orderHeaderCard}>
          <div className={styles.headerTopRow}>
            <div className={styles.orderBadgeGroup}>
              <span className={styles.orderIdBadge}>Order #{orderId}</span>
              <span className={styles.headerDotSep}>•</span>
              <span className={styles.orderDateTag}>Aug 15, 2026</span>
            </div>
          </div>

          <div className={styles.statusBanner}>
            <div className={styles.statusBadgeGreen}>
              <CheckCircle size={15} strokeWidth={2.5} />
              <span>Delivered</span>
            </div>
            <h1 className={styles.heroTitle}>Your order has been delivered.</h1>
            <p className={styles.heroSubtitle}>Delivered on August 27, 2026 • Handed directly to resident</p>
          </div>
        </div>

        {/* PRODUCT CARD */}
        <div className={styles.productCard}>
          <div className={styles.productCardHeader}>
            <span className={styles.sellerTag}>Seller: KickAt Official</span>
            <span className={styles.itemCountTag}>1 Item</span>
          </div>

          <div className={styles.productMainRow}>
            <div className={styles.productImageWrapper}>
              <Image 
                src="/hero-products/pet_bowl.png" 
                alt="Ceramic Anti-Slip Pet Bowl" 
                fill 
                className={styles.productImg}
              />
            </div>
            
            <div className={styles.productInfo}>
              <h2 className={styles.productTitle}>Ceramic Anti-Slip Pet Bowl</h2>
              <div className={styles.productVariantMeta}>
                <span className={styles.metaLabel}>Variant:</span>
                <span className={styles.metaValue}>Matte White</span>
              </div>
              
              <div className={styles.priceRow}>
                <span className={styles.productPrice}>₹1,499</span>
                <span className={styles.offerBadge}>2 Offers Applied</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className={styles.productActionsRow}>
            <Link href={`/account/orders/${orderId}/tracking`} className={styles.primaryTrackBtn}>
              <Truck size={16} />
              <span>Track Shipment</span>
            </Link>
            <Link href={`/orders/${orderId}/return`} className={styles.secondaryReturnBtn}>
              <RotateCcw size={15} />
              <span>Return Item</span>
            </Link>
          </div>
        </div>

        {/* TRACKING HISTORY SECTION */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Clock size={18} className={styles.sectionTitleIcon} />
              <h3 className={styles.sectionTitle}>Tracking History</h3>
              <span className={styles.trackingProgressBadge}>
                <CheckCircle2 size={12} color="#15803D" />
                <span>Completed</span>
              </span>
            </div>
            <Link href={`/account/orders/${orderId}/tracking`} className={styles.viewFullTrackingLink}>
              <span>Full Log</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className={styles.verticalTimeline}>
            {/* Timeline Step 1: Order Confirmed */}
            <div className={`${styles.timelineStep} ${styles.timelineCompleted}`}>
              <div className={styles.timelineLeftColumn}>
                <div className={styles.timelineNode}>
                  <FileCheck size={13} strokeWidth={2.5} />
                </div>
                <div className={styles.timelineLine} />
              </div>
              <div className={styles.timelineContentCard}>
                <div className={styles.timelineStepHeader}>
                  <span className={styles.timelineStepTitle}>Order Confirmed</span>
                  <span className={styles.timelineStepDate}>Mon, Aug 24</span>
                </div>
                <p className={styles.timelineStepDesc}>Order placed &amp; verified by KickAt automated fulfillment systems.</p>
              </div>
            </div>

            {/* Timeline Step 2: Shipped */}
            <div className={`${styles.timelineStep} ${styles.timelineCompleted}`}>
              <div className={styles.timelineLeftColumn}>
                <div className={styles.timelineNode}>
                  <Truck size={13} strokeWidth={2.5} />
                </div>
                <div className={styles.timelineLine} />
              </div>
              <div className={styles.timelineContentCard}>
                <div className={styles.timelineStepHeader}>
                  <span className={styles.timelineStepTitle}>Shipped</span>
                  <span className={styles.timelineStepDate}>Wed, Aug 26</span>
                </div>
                <p className={styles.timelineStepDesc}>Dispatched via BlueDart Express (AWB: #BD8849201)</p>
              </div>
            </div>

            {/* Timeline Step 3: Out for Delivery */}
            <div className={`${styles.timelineStep} ${styles.timelineCompleted}`}>
              <div className={styles.timelineLeftColumn}>
                <div className={styles.timelineNode}>
                  <Navigation size={13} strokeWidth={2.5} />
                </div>
                <div className={styles.timelineLine} />
              </div>
              <div className={styles.timelineContentCard}>
                <div className={styles.timelineStepHeader}>
                  <span className={styles.timelineStepTitle}>Out for Delivery</span>
                  <span className={styles.timelineStepDate}>Thu, Aug 27</span>
                </div>
                <p className={styles.timelineStepDesc}>Courier executive assigned &amp; out for delivery in your area.</p>
              </div>
            </div>

            {/* Timeline Step 4 */}
            <div className={`${styles.timelineStep} ${styles.timelineCompleted} ${styles.timelineActive}`}>
              <div className={styles.timelineLeftColumn}>
                <div className={`${styles.timelineNode} ${styles.activeNodePulse}`}>
                  <PackageCheck size={14} strokeWidth={2.5} />
                  <span className={styles.pulseBeacon} />
                </div>
              </div>
              <div className={`${styles.timelineContentCard} ${styles.activeContentCard}`}>
                <div className={styles.timelineStepHeader}>
                  <div className={styles.titleWithBadge}>
                    <span className={styles.timelineStepTitle}>Delivered</span>
                    <span className={styles.latestUpdatePill}>Latest Update</span>
                  </div>
                  <span className={styles.timelineStepDate}>Thu, Aug 27, 4:15 PM</span>
                </div>
                <p className={styles.timelineStepDesc}>Package successfully delivered. Handed directly to resident. Signed by Sarah.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS GRID: Delivery Details & Financial Summary */}
        <div className={styles.detailsGrid}>
          
          {/* Delivery Details Card */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <MapPin size={18} className={styles.sectionTitleIcon} />
                <h3 className={styles.sectionTitle}>Delivery Details</h3>
              </div>
            </div>

            <div className={styles.deliveryDetailsBody}>
              <div className={styles.infoTile}>
                <div className={styles.tileIconCircle}>
                  <User size={16} color="#FD802E" />
                </div>
                <div className={styles.tileContent}>
                  <div className={styles.tileLabel}>Recipient</div>
                  <div className={styles.tileValue}>Sarah Jenkins</div>
                </div>
              </div>

              <div className={styles.infoTile}>
                <div className={styles.tileIconCircle}>
                  <MapPin size={16} color="#FD802E" />
                </div>
                <div className={styles.tileContent}>
                  <div className={styles.tileLabel}>Delivery Address</div>
                  <div className={styles.tileValue}>123 Pet Lover Lane, Block B, Near Park, Mumbai, 400001</div>
                </div>
              </div>

              <div className={styles.infoTile}>
                <div className={styles.tileIconCircle}>
                  <Phone size={16} color="#FD802E" />
                </div>
                <div className={styles.tileContent}>
                  <div className={styles.tileLabel}>Contact Phone</div>
                  <div className={styles.tileValue}>+91 98765 43210</div>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Summary Card */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <Package size={18} className={styles.sectionTitleIcon} />
                <h3 className={styles.sectionTitle}>Financial Summary</h3>
              </div>
              <span className={styles.paymentMethodBadge}>Paid via UPI</span>
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceLine}>
                <span>Listing price</span>
                <span>₹2,499</span>
              </div>
              <div className={styles.priceLine}>
                <span>Special price</span>
                <span>₹1,599</span>
              </div>
              <div className={styles.priceLine}>
                <span>Delivery &amp; platform fee</span>
                <span className={styles.feeValue}>+₹50</span>
              </div>
              <div className={styles.priceLine}>
                <span>Instant discount</span>
                <span className={styles.discountValue}>-₹150</span>
              </div>

              <div className={styles.priceTotalRow}>
                <div>
                  <div className={styles.totalLabel}>Total Amount Paid</div>
                  <div className={styles.taxInclusiveText}>Inclusive of all taxes</div>
                </div>
                <div className={styles.totalAmountText}>₹1,499</div>
              </div>

              <Link href={`/orders/${orderId}/invoice`} className={styles.secondaryInvoiceBtn}>
                <Download size={15} />
                <span>View Invoice</span>
              </Link>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
