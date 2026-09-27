"use client";

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, MapPin, User, Download, Phone, Truck, CheckCircle, 
  Package, RotateCcw, Clock, Navigation, PackageCheck, CheckCircle2, 
  FileCheck, AlertCircle, ArrowLeft, XCircle, ShoppingBag, Loader2 
} from 'lucide-react';
import styles from './OrderDetails.module.css';
import { orderService } from '@/services/orderService';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [tracking, setTracking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    document.title = `Order #${orderId} Details | KickAt`;

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError('Order details could not be retrieved.');
        }

        // Fetch tracking info in parallel (graceful if unavailable)
        try {
          const trackRes = await orderService.getOrderTracking(orderId);
          if (trackRes.success && trackRes.tracking) {
            setTracking(trackRes.tracking);
          }
        } catch {
          // Tracking optional
        }
      } catch (err: any) {
        console.error('Failed to load order:', err);
        setError(err?.message || 'Failed to load order details. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Skeleton style={{ height: '36px', width: '160px', borderRadius: '8px', marginBottom: '1rem' }} />
            <Skeleton style={{ height: '140px', width: '100%', borderRadius: '16px' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <Skeleton style={{ height: '220px', width: '100%', borderRadius: '16px' }} />
          </div>
          <div className={styles.detailsGrid}>
            <Skeleton style={{ height: '200px', borderRadius: '16px' }} />
            <Skeleton style={{ height: '200px', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid #EBE5DB', 
            padding: '3rem 1.5rem', 
            textAlign: 'center',
            maxWidth: '560px',
            margin: '4rem auto'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: '#FEE2E2', 
              color: '#DC2626', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertCircle size={32} />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A1612', marginBottom: '0.5rem' }}>
              Order Not Found
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#78746D', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {error || `We could not find order #${orderId}. It may not exist or you might need to log in to view it.`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/orders">
                <Button variant="primary" icon={<ArrowLeft size={16} />}>
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formatting helpers
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently Placed';

  const orderStatusUpper = (order.orderStatus || order.status || 'PLACED').toUpperCase();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return {
          icon: <CheckCircle size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#DCFCE7', color: '#15803D', borderColor: 'rgba(21, 128, 61, 0.15)' },
          label: 'Delivered',
          title: 'Your order has been delivered.',
          subtitle: order.deliveryDate || order.estimatedDelivery 
            ? `Delivered on ${new Date(order.deliveryDate || order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'Package successfully received by resident',
        };
      case 'SHIPPED':
        return {
          icon: <Truck size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#DBEAFE', color: '#1D4ED8', borderColor: 'rgba(29, 78, 216, 0.15)' },
          label: 'Shipped',
          title: 'Your order is on the way!',
          subtitle: tracking?.courierPartner 
            ? `Dispatched with ${tracking.courierPartner} • Tracking #${tracking.trackingNumber || order.trackingNumber || order.orderNumber}`
            : 'Package is in transit to your delivery address',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          icon: <Navigation size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#FEF3C7', color: '#B45309', borderColor: 'rgba(180, 83, 9, 0.15)' },
          label: 'Out for Delivery',
          title: 'Out for delivery today!',
          subtitle: 'Our delivery partner is in your area and will arrive soon',
        };
      case 'CANCELLED':
        return {
          icon: <XCircle size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.15)' },
          label: 'Cancelled',
          title: 'This order was cancelled.',
          subtitle: order.cancelReason ? `Reason: ${order.cancelReason}` : 'Cancelled by customer or automated system',
        };
      case 'RETURNED':
        return {
          icon: <RotateCcw size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#F3E8FF', color: '#7E22CE', borderColor: 'rgba(126, 34, 206, 0.15)' },
          label: 'Returned',
          title: 'This order was returned.',
          subtitle: 'Return request processed and closed',
        };
      case 'CONFIRMED':
      case 'PROCESSING':
      case 'PLACED':
      default:
        return {
          icon: <Package size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#FFF7ED', color: '#C2410C', borderColor: 'rgba(194, 65, 12, 0.15)' },
          label: status === 'CONFIRMED' ? 'Confirmed' : status === 'PROCESSING' ? 'Processing' : 'Placed',
          title: 'Your order is confirmed & in progress.',
          subtitle: `Order placed on ${formattedDate} • We are preparing your items`,
        };
    }
  };

  const statusConfig = getStatusConfig(orderStatusUpper);
  const items: any[] = Array.isArray(order.items) ? order.items : [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Navigation Breadcrumb / Back Link */}
        <div style={{ marginBottom: '1rem' }}>
          <Link 
            href="/orders" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              color: '#78746D',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* HERO / HEADER SECTION */}
        <div className={styles.orderHeaderCard}>
          <div className={styles.headerTopRow}>
            <div className={styles.orderBadgeGroup}>
              <span className={styles.orderIdBadge}>Order #{order.orderNumber || order.id}</span>
              <span className={styles.headerDotSep}>•</span>
              <span className={styles.orderDateTag}>{formattedDate}</span>
            </div>
          </div>

          <div className={styles.statusBanner}>
            <div className={styles.statusBadgeGreen} style={statusConfig.badgeStyle}>
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </div>
            <h1 className={styles.heroTitle}>{statusConfig.title}</h1>
            <p className={styles.heroSubtitle}>{statusConfig.subtitle}</p>
          </div>
        </div>

        {/* PRODUCT ITEMS LIST */}
        {items.map((item, idx) => (
          <div key={item.id || idx} className={styles.productCard} style={{ marginBottom: '1.25rem' }}>
            <div className={styles.productCardHeader}>
              <span className={styles.sellerTag}>Seller: KickAt Official</span>
              <span className={styles.itemCountTag}>Qty: {item.quantity}</span>
            </div>

            <div className={styles.productMainRow}>
              <div className={styles.productImageWrapper}>
                <Image 
                  src={item.imageUrl || item.image || '/hero-products/dog_food.png'} 
                  alt={item.productName || 'Ordered Item'} 
                  fill 
                  className={styles.productImg}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              
              <div className={styles.productInfo}>
                <Link 
                  href={item.productId ? `/product/${item.productId}` : '#'} 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h2 className={styles.productTitle}>{item.productName || 'Pet Care Product'}</h2>
                </Link>

                {item.variantName && (
                  <div className={styles.productVariantMeta}>
                    <span className={styles.metaLabel}>Variant:</span>
                    <span className={styles.metaValue}>{item.variantName}</span>
                  </div>
                )}
                
                <div className={styles.priceRow}>
                  <span className={styles.productPrice}>
                    ₹{(item.totalPrice || item.price * item.quantity).toLocaleString()}
                  </span>
                  {item.quantity > 1 && (
                    <span style={{ fontSize: '0.8rem', color: '#78746D' }}>
                      (₹{item.price.toLocaleString()} × {item.quantity})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className={styles.productActionsRow}>
              <Link href={`/orders/${order.id}/tracking`} className={styles.primaryTrackBtn}>
                <Truck size={16} />
                <span>Track Shipment</span>
              </Link>
              {orderStatusUpper === 'DELIVERED' && (
                <Link href={`/orders/${order.id}/return`} className={styles.secondaryReturnBtn}>
                  <RotateCcw size={15} />
                  <span>Return Item</span>
                </Link>
              )}
            </div>
          </div>
        ))}

        {/* TRACKING HISTORY SECTION */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Clock size={18} className={styles.sectionTitleIcon} />
              <h3 className={styles.sectionTitle}>Tracking History</h3>
              <span className={styles.trackingProgressBadge}>
                {orderStatusUpper === 'DELIVERED' ? (
                  <>
                    <CheckCircle2 size={12} color="#15803D" />
                    <span>Delivered</span>
                  </>
                ) : (
                  <>
                    <Truck size={12} color="#2563EB" />
                    <span>{statusConfig.label}</span>
                  </>
                )}
              </span>
            </div>
            <Link href={`/orders/${order.id}/tracking`} className={styles.viewFullTrackingLink}>
              <span>Full Log</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className={styles.verticalTimeline}>
            {/* Step 1: Placed & Confirmed */}
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
                  <span className={styles.timelineStepDate}>{formattedDate}</span>
                </div>
                <p className={styles.timelineStepDesc}>Order verified and payment confirmed by KickAt systems.</p>
              </div>
            </div>

            {/* Step 2: Processing / Shipped */}
            {(orderStatusUpper === 'SHIPPED' || orderStatusUpper === 'OUT_FOR_DELIVERY' || orderStatusUpper === 'DELIVERED') && (
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
                    <span className={styles.timelineStepDate}>
                      {tracking?.history?.[0]?.timestamp 
                        ? new Date(tracking.history[0].timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'In Transit'}
                    </span>
                  </div>
                  <p className={styles.timelineStepDesc}>
                    {tracking?.courierPartner ? `Dispatched via ${tracking.courierPartner}` : 'Dispatched via express logistics facility.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Out for Delivery */}
            {(orderStatusUpper === 'OUT_FOR_DELIVERY' || orderStatusUpper === 'DELIVERED') && (
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
                    <span className={styles.timelineStepDate}>Courier Assigned</span>
                  </div>
                  <p className={styles.timelineStepDesc}>Delivery agent is dispatched with your shipment.</p>
                </div>
              </div>
            )}

            {/* Step 4: Final Status (Delivered or Current Status) */}
            <div className={`${styles.timelineStep} ${styles.timelineCompleted} ${styles.timelineActive}`}>
              <div className={styles.timelineLeftColumn}>
                <div className={`${styles.timelineNode} ${styles.activeNodePulse}`}>
                  {orderStatusUpper === 'DELIVERED' ? (
                    <PackageCheck size={14} strokeWidth={2.5} />
                  ) : orderStatusUpper === 'CANCELLED' ? (
                    <XCircle size={14} strokeWidth={2.5} />
                  ) : (
                    <Package size={14} strokeWidth={2.5} />
                  )}
                  <span className={styles.pulseBeacon} />
                </div>
              </div>
              <div className={`${styles.timelineContentCard} ${styles.activeContentCard}`}>
                <div className={styles.timelineStepHeader}>
                  <div className={styles.titleWithBadge}>
                    <span className={styles.timelineStepTitle}>{statusConfig.label}</span>
                    <span className={styles.latestUpdatePill}>Current Status</span>
                  </div>
                  <span className={styles.timelineStepDate}>
                    {order.updatedAt 
                      ? new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : formattedDate}
                  </span>
                </div>
                <p className={styles.timelineStepDesc}>{statusConfig.subtitle}</p>
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
                  <User size={16} color="#F99205" />
                </div>
                <div className={styles.tileContent}>
                  <div className={styles.tileLabel}>Recipient</div>
                  <div className={styles.tileValue}>
                    {order.user?.name || order.address?.name || 'Valued Customer'}
                  </div>
                </div>
              </div>

              <div className={styles.infoTile}>
                <div className={styles.tileIconCircle}>
                  <MapPin size={16} color="#F99205" />
                </div>
                <div className={styles.tileContent}>
                  <div className={styles.tileLabel}>Delivery Address</div>
                  <div className={styles.tileValue}>
                    {order.address?.houseFlat ? `${order.address.houseFlat}, ` : ''}
                    {order.address?.buildingStreet || 'Address on record'}
                    {order.address?.landmark ? `, Near ${order.address.landmark}` : ''}
                    {order.address?.city ? `, ${order.address.city}` : ''}
                    {order.address?.state ? `, ${order.address.state}` : ''}
                    {order.address?.pincode ? ` - ${order.address.pincode}` : ''}
                  </div>
                </div>
              </div>

              {(order.user?.phone || order.address?.phone) && (
                <div className={styles.infoTile}>
                  <div className={styles.tileIconCircle}>
                    <Phone size={16} color="#F99205" />
                  </div>
                  <div className={styles.tileContent}>
                    <div className={styles.tileLabel}>Contact Phone</div>
                    <div className={styles.tileValue}>
                      {order.user?.phone || order.address?.phone}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Financial Summary Card */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <Package size={18} className={styles.sectionTitleIcon} />
                <h3 className={styles.sectionTitle}>Financial Summary</h3>
              </div>
              <span className={styles.paymentMethodBadge}>
                {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'} via {order.paymentMethod || 'Online'}
              </span>
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceLine}>
                <span>Subtotal</span>
                <span>₹{(order.subtotal || 0).toLocaleString()}</span>
              </div>

              <div className={styles.priceLine}>
                <span>Delivery fee</span>
                <span className={styles.feeValue}>
                  {(order.deliveryFee ?? 0) === 0 ? 'FREE' : `+₹${order.deliveryFee}`}
                </span>
              </div>

              {(order.codFee ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>COD handling fee</span>
                  <span className={styles.feeValue}>+₹{order.codFee}</span>
                </div>
              )}

              {(order.extraFeeAmount ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>{order.extraFeeName || 'Extra fee'}</span>
                  <span className={styles.feeValue}>+₹{order.extraFeeAmount}</span>
                </div>
              )}

              {(order.gstAmount ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>GST {order.gstPercentage ? `(${order.gstPercentage}%)` : ''}</span>
                  <span className={styles.feeValue}>+₹{order.gstAmount}</span>
                </div>
              )}

              {(order.discountAmount ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>Discount</span>
                  <span className={styles.discountValue}>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className={styles.priceTotalRow}>
                <div>
                  <div className={styles.totalLabel}>Total Amount</div>
                  <div className={styles.taxInclusiveText}>Inclusive of all taxes</div>
                </div>
                <div className={styles.totalAmountText}>
                  ₹{(order.grandTotal || 0).toLocaleString()}
                </div>
              </div>

              <Link href={`/orders/${order.id}/invoice`} className={styles.secondaryInvoiceBtn}>
                <Download size={15} />
                <span>View &amp; Download Invoice</span>
              </Link>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
