"use client";

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, MapPin, User, Download, Phone, Truck, CheckCircle, 
  Package, RotateCcw, Clock, Navigation, PackageCheck, CheckCircle2, 
  FileCheck, AlertCircle, ArrowLeft, XCircle, ShoppingBag, Loader2,
  RefreshCw, FileText, X
} from 'lucide-react';
import styles from './OrderDetails.module.css';
import { orderService } from '@/services/orderService';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

function isCancellable(statusStr: string): boolean {
  const upper = (statusStr || '').toUpperCase();
  return ['PLACED', 'PENDING', 'CONFIRMED', 'PROCESSING'].includes(upper);
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [tracking, setTracking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Actions state
  const [isReordering, setIsReordering] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('changed_mind');
  const [cancelReasonOther, setCancelReasonOther] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchOrderDetails = async () => {
    if (!orderId) return;
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
        if (trackRes.success) {
          setTracking(trackRes.tracking || trackRes);
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

  useEffect(() => {
    if (orderId) {
      document.title = `Order #${orderId} Details | KickAt`;
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleReorder = async () => {
    if (!orderId) return;
    setIsReordering(true);
    try {
      const res = await orderService.reorder(orderId);
      if (res && res.success) {
        showToast('Items added to your cart successfully!', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-item-added'));
        }
      } else {
        showToast('Items added to cart!', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-item-added'));
        }
      }
    } catch (err: any) {
      console.error('Reorder failed:', err);
      showToast(err?.message || 'Failed to reorder items.', 'error');
    } finally {
      setIsReordering(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!orderId || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await orderService.downloadInvoicePdf(orderId, order?.orderNumber || orderId);
      showToast('Invoice downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('Download invoice failed:', err);
      showToast('Could not download PDF invoice.', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!orderId) return;
    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(
        orderId,
        cancelReason,
        cancelReason === 'other' ? cancelReasonOther : undefined
      );
      if (res && res.success) {
        showToast('Order has been successfully cancelled.', 'success');
        setShowCancelModal(false);
        setCancelReason('changed_mind');
        setCancelReasonOther('');
        await fetchOrderDetails();
      } else {
        showToast(res?.message || 'Failed to cancel order.', 'error');
      }
    } catch (err: any) {
      console.error('Cancel order failed:', err);
      showToast(err?.message || 'Failed to cancel order.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

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
  const cancellable = isCancellable(orderStatusUpper);

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
            : 'Package successfully received',
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
          subtitle: order.cancelReason ? `Reason: ${order.cancelReason}` : 'Cancelled by customer or store manager',
        };
      case 'RETURNED':
        return {
          icon: <RotateCcw size={15} strokeWidth={2.5} />,
          badgeStyle: { backgroundColor: '#F3E8FF', color: '#7E22CE', borderColor: 'rgba(126, 34, 206, 0.15)' },
          label: 'Returned',
          title: 'This order was returned.',
          subtitle: 'Return request processed and refunded',
        };
      case 'CONFIRMED':
      case 'PROCESSING':
      case 'PACKED':
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
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10000,
            background: toastMessage.type === 'success' ? '#15803D' : '#DC2626',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className={styles.container}>
        
        {/* Navigation Breadcrumb / Back Link */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/orders/${order.id}/invoice`}>
              <Button variant="secondary" size="sm" icon={<FileText size={15} />}>
                Invoice
              </Button>
            </Link>
            {cancellable && (
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<XCircle size={15} color="#DC2626" />} 
                onClick={() => setShowCancelModal(true)}
                style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                Cancel Order
              </Button>
            )}
            {(orderStatusUpper === 'DELIVERED' || orderStatusUpper === 'CANCELLED' || orderStatusUpper === 'RETURNED') && (
              <Button 
                variant="primary" 
                size="sm" 
                icon={isReordering ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                disabled={isReordering}
                onClick={handleReorder}
              >
                {isReordering ? 'Adding...' : 'Buy Again'}
              </Button>
            )}
          </div>
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
              <div className={styles.productImageWrapper} style={{ background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                <SafeImage 
                  src={item.imageUrl || item.image} 
                  productName={item.productName}
                  alt={item.productName || 'Ordered Item'} 
                  fill 
                  className={styles.productImg}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              
              <div className={styles.productInfo}>
                <Link 
                  href={item.productSlug ? `/product/${item.productSlug}${item.variantId ? `?variant=${item.variantId}` : ''}` : item.productId ? `/product/${item.productId}${item.variantId ? `?variant=${item.variantId}` : ''}` : '#'} 
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
                    ₹{(item.totalPrice || item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {item.quantity > 1 && (
                    <span style={{ fontSize: '0.8rem', color: '#78746D' }}>
                      (₹{item.price.toLocaleString('en-IN')} × {item.quantity})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            {orderStatusUpper === 'DELIVERED' && (
              <div className={styles.productActionsRow}>
                <Link href={`/orders/${order.id}/return`} className={styles.secondaryReturnBtn}>
                  <RotateCcw size={15} />
                  <span>Return Item</span>
                </Link>
              </div>
            )}
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
                <p className={styles.timelineStepDesc}>Order verified and confirmed by KickAt systems.</p>
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

            {/* Step 4: Final Status (Delivered / Cancelled / Current Status) */}
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
                    {order.user?.name || order.address?.name || order.address?.fullName || 'Valued Customer'}
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
                    {order.address?.buildingStreet || order.address?.addressLine || 'Address on record'}
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
                <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className={styles.priceLine}>
                <span>Delivery fee</span>
                <span className={styles.feeValue}>
                  {(order.deliveryFee ?? 0) === 0 ? 'FREE' : `+₹${Number(order.deliveryFee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>

              {(order.codFee ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>COD handling fee</span>
                  <span className={styles.feeValue}>+₹{Number(order.codFee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {(order.extraFeeAmount ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>{order.extraFeeName || 'Extra fee'}</span>
                  <span className={styles.feeValue}>+₹{Number(order.extraFeeAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {(order.gstAmount ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>GST {order.gstPercentage ? `(${order.gstPercentage}%)` : ''}</span>
                  <span className={styles.feeValue}>+₹{Number(order.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {(order.discountAmount ?? 0) > 0 && (
                <div className={styles.priceLine}>
                  <span>Discount</span>
                  <span className={styles.discountValue}>-₹{Number(order.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className={styles.priceTotalRow}>
                <div>
                  <div className={styles.totalLabel}>Total Amount</div>
                  <div className={styles.taxInclusiveText}>Inclusive of all taxes</div>
                </div>
                <div className={styles.totalAmountText}>
                  ₹{Number(order.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <Link href={`/orders/${order.id}/invoice`} className={styles.secondaryInvoiceBtn} style={{ flex: 1 }}>
                  <FileText size={15} />
                  <span>View Invoice</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className={styles.secondaryInvoiceBtn}
                  style={{ flex: 1, cursor: isDownloadingPdf ? 'not-allowed' : 'pointer' }}
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(26, 22, 18, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1A1612' }}>
                    Cancel Order #{order.orderNumber || order.id}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#78746D', margin: 0 }}>
                    Are you sure you want to cancel this order?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: '#F5F2EC',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                Please select a reason:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D6D1C7',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FAF7F2',
                }}
              >
                <option value="changed_mind">Changed my mind</option>
                <option value="ordered_by_mistake">Ordered by mistake</option>
                <option value="found_cheaper">Found cheaper elsewhere</option>
                <option value="other">Other reason</option>
              </select>

              {cancelReason === 'other' && (
                <textarea
                  placeholder="Please specify your reason..."
                  value={cancelReasonOther}
                  onChange={(e) => setCancelReasonOther(e.target.value)}
                  maxLength={200}
                  style={{
                    marginTop: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #D6D1C7',
                    fontSize: '0.85rem',
                    outline: 'none',
                    minHeight: '70px',
                    resize: 'none',
                  }}
                />
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '8px',
            }}>
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Order
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Cancelling...
                  </>
                ) : (
                  'Confirm Cancel'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
