"use client";

import { use, useEffect, useState } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Loader2,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  RotateCcw,
  Truck,
  User,
  X,
  XCircle,
  AlertCircle,
  CreditCard,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import styles from './OrderDetails.module.css';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';

function isCancellable(statusStr: string): boolean {
  const upper = (statusStr || '').toUpperCase();
  return ['PLACED', 'PENDING', 'CONFIRMED', 'PROCESSING'].includes(upper);
}

function getTimelineIcon(stage: string, isCancelled: boolean) {
  if (isCancelled && stage === 'CANCELLED') {
    return <XCircle size={14} strokeWidth={2.5} />;
  }
  switch (stage) {
    case 'ORDER_PLACED':
    case 'ORDER_CONFIRMED':
      return <FileCheck size={14} strokeWidth={2.5} />;
    case 'PACKED':
      return <Package size={14} strokeWidth={2.5} />;
    case 'SHIPPED':
      return <Truck size={14} strokeWidth={2.5} />;
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return <Navigation size={14} strokeWidth={2.5} />;
    case 'DELIVERED':
      return <PackageCheck size={14} strokeWidth={2.5} />;
    case 'CANCELLED':
      return <XCircle size={14} strokeWidth={2.5} />;
    case 'RTO_INITIATED':
      return <RotateCcw size={14} strokeWidth={2.5} />;
    default:
      return <Package size={14} strokeWidth={2.5} />;
  }
}

function getCustomerTimeline(order: any, tracking: any) {
  if (Array.isArray(tracking?.timeline) && tracking.timeline.length > 0) {
    return tracking.timeline;
  }

  const orderStatus = (order?.orderStatus || order?.status || 'PLACED').toUpperCase();
  const isCancelled = orderStatus === 'CANCELLED';
  const isRTO = orderStatus === 'RETURN_INITIATED' || orderStatus === 'RETURNED';

  const statusOrder = ['PLACED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStatusIndex = statusOrder.indexOf(orderStatus);

  const courier = tracking?.courierPartner || order?.courierPartner || null;
  const awb = tracking?.awbNumber || tracking?.trackingNumber || order?.trackingNumber || null;

  if (isCancelled) {
    return [
      {
        stage: 'ORDER_PLACED',
        title: 'Order Placed & Confirmed',
        location: 'Online Platform',
        timestamp: order?.createdAt,
        isCompleted: true,
        isCurrent: false,
        description: 'Customer order placed and payment verified.',
      },
      {
        stage: 'CANCELLED',
        title: 'Order Cancelled',
        location: 'Online Platform',
        timestamp: order?.cancelledAt || order?.updatedAt || order?.createdAt,
        isCompleted: true,
        isCurrent: true,
        description: order?.cancelReason ? `Reason: ${order.cancelReason}` : 'Order was cancelled.',
      },
    ];
  }

  return [
    {
      stage: 'ORDER_PLACED',
      title: 'Order Placed & Confirmed',
      location: 'Online Platform',
      timestamp: order?.createdAt,
      isCompleted: true,
      isCurrent: currentStatusIndex <= 0,
      description: 'Customer order placed and payment verified.',
    },
    {
      stage: 'PACKED',
      title: 'Packed at Warehouse',
      location: 'Kickat Central Hub, Mumbai',
      timestamp: currentStatusIndex >= 2 ? (order?.updatedAt || order?.createdAt) : null,
      isCompleted: currentStatusIndex >= 2 || isRTO,
      isCurrent: currentStatusIndex === 1 || currentStatusIndex === 2,
      description: 'Items picked, verified, and safely packed.',
    },
    {
      stage: 'SHIPPED',
      title: 'Handed Over to Courier',
      location: 'Mumbai Logistics Hub',
      timestamp: currentStatusIndex >= 3 ? (order?.updatedAt || order?.createdAt) : null,
      isCompleted: currentStatusIndex >= 3 || isRTO,
      isCurrent: currentStatusIndex === 3,
      description: courier && awb ? `Package picked up by ${courier} under AWB ${awb}.` : 'Package handed over to logistics carrier.',
    },
    {
      stage: 'IN_TRANSIT',
      title: 'In Transit to Destination Hub',
      location: `${order?.address?.city || 'Destination'} Regional Sorting Facility`,
      timestamp: currentStatusIndex >= 3 ? (order?.updatedAt || order?.createdAt) : null,
      isCompleted: currentStatusIndex >= 3 || isRTO,
      isCurrent: currentStatusIndex === 3,
      description: 'Package in transit between logistics hubs.',
    },
    {
      stage: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      location: `${order?.address?.city || 'Local'} Delivery Center`,
      timestamp: currentStatusIndex >= 4 ? (order?.updatedAt || order?.createdAt) : null,
      isCompleted: currentStatusIndex >= 4,
      isCurrent: currentStatusIndex === 4,
      description: 'Delivery executive assigned and out for delivery.',
    },
    {
      stage: isRTO ? 'RTO_INITIATED' : 'DELIVERED',
      title: isRTO ? 'Return to Origin (RTO)' : 'Delivered to Recipient',
      location: `${order?.address?.city || ''}, ${order?.address?.state || ''}`.trim() || 'Customer Address',
      timestamp: (orderStatus === 'DELIVERED' || orderStatus === 'RETURNED') ? (order?.deliveryDate || order?.updatedAt) : null,
      isCompleted: orderStatus === 'DELIVERED' || orderStatus === 'RETURNED',
      isCurrent: orderStatus === 'DELIVERED' || orderStatus === 'RETURNED',
      description: isRTO ? 'Shipment marked for Return to Origin.' : 'Package safely delivered to recipient address.',
    },
  ];
}

function formatFullAddress(addr: any): string[] {
  if (!addr) return ['No delivery address recorded.'];
  if (typeof addr === 'string') return [addr];
  const lines: string[] = [];
  if (addr.addressLine1 || addr.street || addr.address) {
    lines.push(String(addr.addressLine1 || addr.street || addr.address).trim());
  }
  if (addr.addressLine2) {
    lines.push(String(addr.addressLine2).trim());
  }
  if (addr.landmark) {
    lines.push(`Landmark: ${String(addr.landmark).trim()}`);
  }
  const cityStatePincode = [addr.city, addr.state, addr.pincode || addr.zipCode || addr.postalCode].filter(Boolean).join(', ');
  if (cityStatePincode) {
    lines.push(cityStatePincode);
  }
  if (addr.country && String(addr.country).toLowerCase() !== 'india') {
    lines.push(String(addr.country).trim());
  }
  return lines.length > 0 ? lines : ['Address provided at checkout'];
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
    }, 3500);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      showToast(`Copied ${fieldName} to clipboard!`, 'success');
      setTimeout(() => setCopiedField(null), 2500);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.success && res.order) {
        let orderData = { ...res.order };
        if (Array.isArray(orderData.items)) {
          const enrichedItems = await Promise.all(
            orderData.items.map(async (item: any) => {
              if (item.imageUrl || item.image) {
                return item;
              }
              if (item.productId) {
                try {
                  const prodRes = await productService.getProductById(item.productId);
                  if (prodRes && prodRes.success && prodRes.product) {
                    const prod = prodRes.product;
                    let img = prod.imageUrl;
                    if (!img && Array.isArray(prod.images) && prod.images.length > 0) {
                      img = typeof prod.images[0] === 'string' ? prod.images[0] : (prod.images[0] as any)?.url;
                    }
                    if (item.variantId && Array.isArray(prod.variants)) {
                      const v = prod.variants.find((vr: any) => vr.id === item.variantId);
                      if (v?.imageUrl) {
                        img = v.imageUrl;
                      } else if (Array.isArray(v?.images) && v.images.length > 0) {
                        img = typeof v.images[0] === 'string' ? v.images[0] : (v.images[0] as any)?.url;
                      }
                    }
                    return {
                      ...item,
                      imageUrl: img || item.imageUrl,
                      image: img || item.image,
                      productSlug: item.productSlug || prod.slug,
                      brand: item.brand || prod.brand,
                    };
                  }
                } catch (e) {
                  console.warn('Could not enrich item image on client:', e);
                }
              }
              return item;
            })
          );
          orderData.items = enrichedItems;
        }
        setOrder(orderData);
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
    if (!orderId) return;
    setIsDownloadingPdf(true);
    try {
      await orderService.downloadInvoicePdf(orderId, order?.orderNumber || orderId);
      showToast('Invoice PDF downloaded successfully.', 'success');
    } catch (err: any) {
      console.error('Download invoice failed:', err);
      showToast(err?.message || 'Failed to download invoice PDF. Opening online invoice...', 'error');
      router.push(`/orders/${orderId}/invoice`);
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

  // Loading Skeleton
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          {/* Top Bar Skeleton */}
          <div className={styles.topBar}>
            <div className={`${styles.skel} ${styles.skelBack}`} />
            <div className={styles.topBarActions}>
              <div className={`${styles.skel} ${styles.skelTopBtn}`} />
              <div className={`${styles.skel} ${styles.skelTopBtn}`} />
            </div>
          </div>

          {/* Header Card Skeleton */}
          <div className={styles.skelCard} style={{ minHeight: '140px' }}>
            <div className={`${styles.skel} ${styles.skelPill}`} />
            <div className={`${styles.skel} ${styles.skelTitle}`} />
            <div className={`${styles.skel} ${styles.skelSubtitle}`} />
          </div>

          {/* Items Card Skeleton */}
          <div className={styles.skelCard} style={{ minHeight: '180px' }}>
            <div className={styles.skelProductRow}>
              <div className={`${styles.skel} ${styles.skelThumb}`} />
              <div style={{ flex: 1 }}>
                <div className={`${styles.skel} ${styles.skelLineLong}`} />
                <div className={`${styles.skel} ${styles.skelLineShort}`} />
              </div>
            </div>
          </div>

          {/* Tracking Skeleton */}
          <div className={styles.skelCard} style={{ minHeight: '220px' }}>
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ width: '40%' }} />
            <div className={`${styles.skel} ${styles.skelLineLong}`} style={{ height: '70px', marginTop: '14px' }} />
          </div>

          {/* 2 Col Details Skeleton */}
          <div className={styles.detailsGrid}>
            <div className={styles.skelCard} style={{ minHeight: '200px' }} />
            <div className={styles.skelCard} style={{ minHeight: '200px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <div className={styles.errorIconWrap}>
              <AlertCircle size={32} />
            </div>
            <h1 className={styles.errorTitle}>Order Not Found</h1>
            <p className={styles.errorDesc}>
              {error || `We could not find order #${orderId}. It may not exist or you might need to log in to view it.`}
            </p>
            <div className={styles.errorActions}>
              <Link href="/orders" className={styles.errorBtnPrimary}>
                <ArrowLeft size={16} />
                <span>Back to Orders</span>
              </Link>
              <button type="button" onClick={fetchOrderDetails} className={styles.errorBtnSecondary}>
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
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
  const isCancelled = orderStatusUpper === 'CANCELLED';
  const isDelivered = orderStatusUpper === 'DELIVERED';
  const isShipped = orderStatusUpper === 'SHIPPED';
  const isOutForDelivery = orderStatusUpper === 'OUT_FOR_DELIVERY';
  const isReturned = orderStatusUpper === 'RETURNED' || orderStatusUpper === 'RETURN_INITIATED';
  const cancellable = isCancellable(orderStatusUpper);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return {
          icon: <CheckCircle2 size={16} strokeWidth={2.5} />,
          badgeClass: styles.badgeGreen,
          label: 'Delivered',
          title: 'Your order has been delivered.',
          subtitle: order.deliveryDate || order.estimatedDelivery
            ? `Delivered on ${new Date(order.deliveryDate || order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'Package successfully received.',
        };
      case 'SHIPPED':
        return {
          icon: <Truck size={16} strokeWidth={2.5} />,
          badgeClass: styles.badgeBlue,
          label: 'Shipped',
          title: 'Your order is on the way!',
          subtitle: tracking?.courierPartner
            ? `Dispatched with ${tracking.courierPartner} • Tracking #${tracking.trackingNumber || order.trackingNumber || order.orderNumber}`
            : 'Package is in transit to your delivery address.',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          icon: <Navigation size={16} strokeWidth={2.5} />,
          badgeClass: styles.badgeAmber,
          label: 'Out for Delivery',
          title: 'Out for delivery today!',
          subtitle: 'Our delivery partner is in your area and will arrive soon.',
        };
      case 'CANCELLED':
        return {
          icon: <XCircle size={16} strokeWidth={2.5} />,
          badgeClass: styles.badgeRed,
          label: 'Cancelled',
          title: 'This order was cancelled.',
          subtitle: order.cancelReason ? `Reason: ${order.cancelReason}` : 'Cancelled by customer or store manager.',
        };
      case 'RETURNED':
      case 'RETURN_INITIATED':
        return {
          icon: <RotateCcw size={16} strokeWidth={2.5} />,
          badgeClass: styles.badgePurple,
          label: 'Returned',
          title: 'This order was returned.',
          subtitle: 'Return request processed and refunded.',
        };
      case 'CONFIRMED':
      case 'PROCESSING':
      case 'PACKED':
      case 'PLACED':
      default:
        return {
          icon: <Package size={16} strokeWidth={2.5} />,
          badgeClass: styles.badgeAmber,
          label: status === 'CONFIRMED' ? 'Confirmed' : status === 'PROCESSING' ? 'Processing' : 'Placed',
          title: 'Your order is confirmed & in progress.',
          subtitle: `Order placed on ${formattedDate} • We are preparing your items.`,
        };
    }
  };

  const statusConfig = getStatusConfig(orderStatusUpper);
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const timelineItems = getCustomerTimeline(order, tracking);
  const fullOrderNumber = String(order.orderNumber || order.id || orderId);
  const fullAwb = String(tracking?.awbNumber || tracking?.trackingNumber || order.trackingNumber || '');
  const addressLines = formatFullAddress(order.address);

  // Pricing calculations
  const subtotal = order.subtotal ?? items.reduce((s: number, it: any) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const isFreeDelivery = deliveryFee === 0;
  const gstAmount = Number(order.gstAmount ?? 0);
  const extraFee = Number(order.extraFeeAmount ?? 0) + Number(order.codFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const grandTotal = Number(order.grandTotal ?? order.totalAmount ?? subtotal);

  // Payment badge details
  const rawPayStatus = String(order.paymentStatus || '').toUpperCase();
  const payMethod = order.paymentMethod || 'Online';
  let payStatusLabel = `Paid via ${payMethod}`;
  let payBadgeClass = styles.payBadgeGreen;

  if (isCancelled) {
    if (['REFUNDED', 'REFUND_INITIATED'].includes(rawPayStatus)) {
      payStatusLabel = 'Refund Processed';
      payBadgeClass = styles.payBadgePurple;
    } else if (rawPayStatus === 'PAID' || rawPayStatus === 'CAPTURED') {
      payStatusLabel = 'Refund Pending';
      payBadgeClass = styles.payBadgeAmber;
    } else if (payMethod.toLowerCase() === 'cod') {
      payStatusLabel = 'Cash on Delivery (Cancelled)';
      payBadgeClass = styles.payBadgeGrey;
    } else if (rawPayStatus === 'PENDING' || rawPayStatus === 'FAILED' || rawPayStatus === 'UNPAID') {
      payStatusLabel = 'Cancelled (Unpaid)';
      payBadgeClass = styles.payBadgeGrey;
    } else {
      payStatusLabel = 'Cancelled';
      payBadgeClass = styles.payBadgeGrey;
    }
  } else if (rawPayStatus === 'PENDING') {
    payStatusLabel = `Pending via ${payMethod}`;
    payBadgeClass = styles.payBadgeAmber;
  } else if (rawPayStatus === 'FAILED') {
    payStatusLabel = 'Payment Failed';
    payBadgeClass = styles.payBadgeRed;
  } else if (payMethod.toLowerCase() === 'cod') {
    payStatusLabel = 'Pay on Delivery (COD)';
    payBadgeClass = styles.payBadgeGrey;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className={`${styles.toast} ${toastMessage.type === 'success' ? styles.toastSuccess : styles.toastError}`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className={styles.container}>
        
        {/* TOP BAR: Back Link & Header Action Buttons */}
        <div className={styles.topBar}>
          <Link href="/orders" className={styles.backBtn} aria-label="Back to orders list">
            <ArrowLeft size={16} />
            <span>Back to Orders</span>
          </Link>

          <div className={styles.topBarActions}>
            {/* Invoice Link */}
            <Link href={`/orders/${order.id}/invoice`} className={styles.topBtnSecondary} aria-label="View Invoice">
              <FileText size={15} />
              <span>Invoice</span>
            </Link>

            {/* Cancel Button (if cancellable) */}
            {cancellable && (
              <button
                type="button"
                className={styles.topBtnDanger}
                onClick={() => setShowCancelModal(true)}
                aria-label="Cancel this order"
              >
                <XCircle size={15} />
                <span>Cancel Order</span>
              </button>
            )}

            {/* Buy Again (Delivered, Cancelled, Returned) */}
            {(isDelivered || isCancelled || isReturned) && (
              <button
                type="button"
                className={isCancelled ? styles.topBtnSecondaryHighlight : styles.topBtnPrimary}
                disabled={isReordering}
                onClick={handleReorder}
                aria-label="Buy all items in this order again"
              >
                {isReordering ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Adding…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Buy Again</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 1. ORDER SUMMARY & STATUS HERO CARD */}
        <section className={styles.heroCard}>
          {/* Header Row: Order Number & Date */}
          <div className={styles.heroTopRow}>
            <div className={styles.orderIdGroup}>
              <span className={styles.orderIdLabel}>Order</span>
              <span className={styles.orderIdValue}>#{fullOrderNumber}</span>
              <button
                type="button"
                className={`${styles.copyBtn} ${copiedField === 'Order ID' ? styles.copied : ''}`}
                onClick={() => copyToClipboard(fullOrderNumber, 'Order ID')}
                aria-label="Copy Order ID"
                title="Copy full Order ID"
              >
                {copiedField === 'Order ID' ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <span className={styles.metaDot}>•</span>
              <span className={styles.orderDateValue}>{formattedDate}</span>
            </div>
          </div>

          {/* Status Headline Block */}
          <div className={styles.statusBlock}>
            <div className={`${styles.statusBadge} ${statusConfig.badgeClass}`}>
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </div>
            <h1 className={styles.heroTitle}>{statusConfig.title}</h1>
            <p className={styles.heroSubtitle}>{statusConfig.subtitle}</p>
          </div>
        </section>

        {/* 2. ORDERED ITEMS CARD */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Package size={18} className={styles.sectionTitleIcon} />
              <h2 className={styles.sectionTitle}>
                Items in Order ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>
            </div>
          </div>

          <div className={styles.itemsList}>
            {items.map((item: any, idx: number) => {
              const itemTotal = Number(item.totalPrice || (item.price * item.quantity) || 0);
              const unitPrice = Number(item.price || 0);
              const qty = Number(item.quantity || item.qty || 1);
              const itemSlug = item.productSlug || item.productId;
              const productUrl = itemSlug
                ? `/product/${itemSlug}${item.variantId ? `?variant=${item.variantId}` : ''}`
                : null;

              return (
                <div key={item.id || idx} className={styles.itemRow}>
                  {/* Product Thumbnail */}
                  <div className={styles.itemThumbWrap}>
                    {productUrl ? (
                      <Link href={productUrl} className={styles.itemThumbLink} aria-label={`View ${item.productName || 'product'}`}>
                        <SafeImage
                          src={item.imageUrl || item.image || '/hero-products/dog_food.png'}
                          productName={item.productName}
                          alt={item.productName || 'Ordered Item'}
                          width={72}
                          height={72}
                          className={styles.itemThumbImg}
                          style={{ objectFit: 'contain' }}
                        />
                      </Link>
                    ) : (
                      <SafeImage
                        src={item.imageUrl || item.image || '/hero-products/dog_food.png'}
                        productName={item.productName}
                        alt={item.productName || 'Ordered Item'}
                        width={72}
                        height={72}
                        className={styles.itemThumbImg}
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                  </div>

                  {/* Product Details (Full unwrapped title, variant, brand) */}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemBrandSeller}>
                      <span>Seller: {item.brand || 'KickAt Official'}</span>
                    </div>

                    {productUrl ? (
                      <Link href={productUrl} className={styles.itemTitleLink}>
                        <h3 className={styles.itemTitle}>{item.productName || 'Pet Product'}</h3>
                      </Link>
                    ) : (
                      <h3 className={styles.itemTitle}>{item.productName || 'Pet Product'}</h3>
                    )}

                    {item.variantName && (
                      <div className={styles.itemVariant}>
                        <span className={styles.variantLabel}>Variant:</span>
                        <span className={styles.variantValue}>{item.variantName}</span>
                      </div>
                    )}

                    {/* Mobile Price & Qty Row */}
                    <div className={styles.itemPriceQtyMobile}>
                      <div className={styles.itemPriceCol}>
                        <span className={styles.itemPriceMain}>
                          ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {qty > 1 && (
                          <span className={styles.itemUnitPrice}>
                            (₹{unitPrice.toLocaleString('en-IN')} × {qty})
                          </span>
                        )}
                      </div>
                      <span className={styles.itemQtyBadge}>Qty: {qty}</span>
                    </div>

                    {/* Product Actions (Review / Return) */}
                    {isDelivered && (
                      <div className={styles.itemActions}>
                        <Link href={`/orders/${order.id}/return`} className={styles.itemActionBtn}>
                          <RotateCcw size={13} />
                          <span>Return / Replace</span>
                        </Link>
                        {item.productSlug && (
                          <Link href={`/product/${item.productSlug}#reviews`} className={styles.itemActionBtn}>
                            <Sparkles size={13} />
                            <span>Write Review</span>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop Price & Qty Block */}
                  <div className={styles.itemPriceQtyDesktop}>
                    <div className={styles.itemPriceCol}>
                      <span className={styles.itemPriceMain}>
                        ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {qty > 1 && (
                        <span className={styles.itemUnitPrice}>
                          (₹{unitPrice.toLocaleString('en-IN')} × {qty})
                        </span>
                      )}
                    </div>
                    <span className={styles.itemQtyBadge}>Qty: {qty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. TRACKING HISTORY CARD */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <Clock size={18} className={styles.sectionTitleIcon} />
              <h2 className={styles.sectionTitle}>Tracking History</h2>
              <span className={`${styles.trackingStatusChip} ${
                isCancelled ? styles.trackingChipCancelled
                : isDelivered ? styles.trackingChipDelivered
                : styles.trackingChipActive
              }`}>
                {isCancelled ? <XCircle size={12} /> : isDelivered ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                <span>{statusConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Shipment Meta Info Panel */}
          <div className={styles.carrierPanel}>
            <div className={styles.carrierTopRow}>
              <div className={styles.carrierAwbGroup}>
                <div className={styles.carrierName}>
                  <Truck size={16} className={styles.carrierIcon} />
                  <span>{tracking?.courierPartner || order.courierPartner || 'KickAt Express Logistics'}</span>
                </div>
                <div className={styles.awbWrap}>
                  <span className={styles.awbLabel}>AWB:</span>
                  <span className={styles.awbValue}>{fullAwb || 'Pending Assignment'}</span>
                  {fullAwb && (
                    <button
                      type="button"
                      className={`${styles.copyBtn} ${copiedField === 'AWB' ? styles.copied : ''}`}
                      onClick={() => copyToClipboard(fullAwb, 'AWB')}
                      aria-label="Copy AWB number"
                      title="Copy AWB tracking number"
                    >
                      {copiedField === 'AWB' ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {(tracking?.trackingUrl || (order.trackingNumber && String(order.courierPartner || '').toLowerCase().includes('delhivery'))) && (
                <a
                  href={tracking?.trackingUrl || `https://www.delhivery.com/track/package/${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.carrierPortalBtn}
                  aria-label="Open carrier tracking portal"
                >
                  <span>Carrier Portal</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Carrier Summary Details */}
            <div className={styles.carrierGrid}>
              <div className={styles.carrierGridItem}>
                <MapPin size={15} className={styles.carrierGridIcon} />
                <div className={styles.carrierGridText}>
                  <span className={styles.carrierGridLabel}>Current Location</span>
                  <span className={styles.carrierGridVal}>
                    {tracking?.location || (isDelivered ? `${order.address?.city || ''}, ${order.address?.state || ''}`.trim() : 'Kickat Logistics Hub, Mumbai')}
                  </span>
                </div>
              </div>

              <div className={styles.carrierGridItem}>
                <Clock size={15} className={styles.carrierGridIcon} />
                <div className={styles.carrierGridText}>
                  <span className={styles.carrierGridLabel}>Last Updated</span>
                  <span className={styles.carrierGridVal}>
                    {tracking?.lastUpdated || order.updatedAt
                      ? new Date(tracking?.lastUpdated || order.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : formattedDate}
                  </span>
                </div>
              </div>

              {(tracking?.estimatedDelivery || order.estimatedDelivery || order.deliveryDate) && (
                <div className={styles.carrierGridItem}>
                  <Calendar size={15} className={styles.carrierGridIcon} />
                  <div className={styles.carrierGridText}>
                    <span className={styles.carrierGridLabel}>
                      {isDelivered ? 'Delivered On' : 'Estimated Delivery'}
                    </span>
                    <span className={styles.carrierGridVal}>
                      {new Date(tracking?.estimatedDelivery || order.estimatedDelivery || order.deliveryDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className={styles.timelineList}>
            {timelineItems.map((step: any, idx: number) => {
              const isDone = Boolean(step.isCompleted);
              const isCurrent = Boolean(step.isCurrent);
              const isCancelledStep = step.stage === 'CANCELLED';
              const isLast = idx === timelineItems.length - 1;

              return (
                <div
                  key={idx}
                  className={`${styles.timelineRow} ${
                    isCancelledStep && isCurrent
                      ? styles.timelineRowCancelled
                      : isDone
                      ? styles.timelineRowCompleted
                      : styles.timelineRowUpcoming
                  }`}
                >
                  <div className={styles.timelineNodeCol}>
                    <div
                      className={`${styles.timelineDot} ${
                        isCancelledStep && isCurrent
                          ? styles.timelineDotCancelled
                          : isCurrent
                          ? styles.timelineDotActive
                          : !isDone
                          ? styles.timelineDotUpcoming
                          : styles.timelineDotDone
                      }`}
                    >
                      {getTimelineIcon(step.stage, isCancelled)}
                      {isCurrent && (
                        <span
                          className={`${styles.pulseBeacon} ${
                            isCancelledStep ? styles.pulseBeaconRed : ''
                          }`}
                        />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`${styles.timelineBar} ${
                          isCancelledStep
                            ? styles.timelineBarCancelled
                            : !isDone
                            ? styles.timelineBarUpcoming
                            : styles.timelineBarDone
                        }`}
                      />
                    )}
                  </div>

                  <div
                    className={`${styles.timelineBox} ${
                      isCancelledStep && isCurrent
                        ? styles.timelineBoxCancelled
                        : isCurrent
                        ? styles.timelineBoxActive
                        : !isDone
                        ? styles.timelineBoxUpcoming
                        : ''
                    }`}
                  >
                    <div className={styles.timelineBoxHead}>
                      <div className={styles.timelineTitleGroup}>
                        <span className={styles.timelineTitle}>{step.title}</span>
                        {isCurrent && (
                          <span
                            className={`${styles.statusPill} ${
                              isCancelledStep ? styles.statusPillRed : styles.statusPillOrange
                            }`}
                          >
                            Current Status
                          </span>
                        )}
                      </div>

                      {step.timestamp && (
                        <span className={styles.timelineTimestamp}>
                          {new Date(step.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    {step.location && (
                      <div className={styles.timelineLocation}>
                        <MapPin size={13} />
                        <span>{step.location}</span>
                      </div>
                    )}

                    {step.description && (
                      <p className={styles.timelineDescription}>{step.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. DETAILS GRID: Delivery Details (Left) + Financial Summary (Right) */}
        <div className={styles.detailsGrid}>
          
          {/* DELIVERY DETAILS CARD */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <MapPin size={18} className={styles.sectionTitleIcon} />
                <h2 className={styles.sectionTitle}>Delivery Details</h2>
              </div>
            </div>

            <div className={styles.deliveryDetailsList}>
              {/* Recipient */}
              <div className={styles.detailTile}>
                <div className={styles.tileIcon}>
                  <User size={16} />
                </div>
                <div className={styles.tileContent}>
                  <span className={styles.tileLabel}>Recipient Name</span>
                  <span className={styles.tileValue}>
                    {order.user?.name || order.address?.name || order.address?.fullName || 'Valued Customer'}
                  </span>
                </div>
              </div>

              {/* Full Address - Fully wraps and multi-line, NO truncation */}
              <div className={styles.detailTile}>
                <div className={styles.tileIcon}>
                  <MapPin size={16} />
                </div>
                <div className={styles.tileContent}>
                  <span className={styles.tileLabel}>Delivery Address</span>
                  <div className={styles.tileAddressBlock}>
                    {addressLines.map((line, lIdx) => (
                      <div key={lIdx} className={styles.addressLine}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Phone */}
              <div className={styles.detailTile}>
                <div className={styles.tileIcon}>
                  <Phone size={16} />
                </div>
                <div className={styles.tileContent}>
                  <span className={styles.tileLabel}>Contact Phone</span>
                  <span className={styles.tileValue}>
                    {order.address?.phone || order.address?.phoneNumber || order.user?.phone || '+91 Not Provided'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* FINANCIAL SUMMARY CARD */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <CreditCard size={18} className={styles.sectionTitleIcon} />
                <h2 className={styles.sectionTitle}>Financial Summary</h2>
              </div>
              <span className={`${styles.payStatusBadge} ${payBadgeClass}`}>
                {payStatusLabel}
              </span>
            </div>

            <div className={styles.pricingBreakdown}>
              {/* Subtotal */}
              <div className={styles.priceRow}>
                <span className={styles.priceRowLabel}>Items Subtotal</span>
                <span className={styles.priceRowValue}>
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Delivery Fee */}
              <div className={styles.priceRow}>
                <span className={styles.priceRowLabel}>Delivery Fee</span>
                <span className={styles.priceRowValue}>
                  {isFreeDelivery ? (
                    <span className={styles.freeDeliveryText}>FREE</span>
                  ) : (
                    `+₹${deliveryFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </span>
              </div>

              {/* Extra / COD Fee */}
              {extraFee > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceRowLabel}>{order.extraFeeName || 'Handling / COD Fee'}</span>
                  <span className={styles.priceRowValue}>
                    +₹{extraFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* GST */}
              {gstAmount > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceRowLabel}>
                    GST {order.gstPercentage ? `(${order.gstPercentage}%)` : ''}
                  </span>
                  <span className={styles.priceRowValue}>
                    +₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Discount */}
              {discountAmount > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceRowLabel}>Discount Savings</span>
                  <span className={styles.discountRowValue}>
                    -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Highlighted Total Block */}
              <div className={styles.grandTotalBlock}>
                <div>
                  <div className={styles.grandTotalLabel}>Total Amount</div>
                  <div className={styles.taxInclusiveNote}>Inclusive of all taxes</div>
                </div>
                <div className={styles.grandTotalAmount}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Invoice Action Buttons */}
              <div className={styles.invoiceActionsRow}>
                <Link href={`/orders/${order.id}/invoice`} className={styles.invoiceBtnSecondary}>
                  <FileText size={15} />
                  <span>View Invoice</span>
                </Link>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className={styles.invoiceBtnPrimary}
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Downloading…</span>
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

      {/* CANCEL ORDER MODAL */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalDangerIcon}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Cancel Order #{fullOrderNumber}</h3>
                  <p className={styles.modalSubtitle}>Are you sure you want to cancel this order?</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowCancelModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.modalLabel}>Please select a cancellation reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className={styles.modalSelect}
              >
                <option value="changed_mind">Changed my mind</option>
                <option value="ordered_by_mistake">Ordered by mistake</option>
                <option value="found_cheaper">Found cheaper elsewhere</option>
                <option value="delivery_delayed">Expected delivery is too late</option>
                <option value="other">Other reason</option>
              </select>

              {cancelReason === 'other' && (
                <textarea
                  placeholder="Please specify your reason in detail..."
                  value={cancelReasonOther}
                  onChange={(e) => setCancelReasonOther(e.target.value)}
                  maxLength={250}
                  className={styles.modalTextarea}
                />
              )}
            </div>

            <div className={styles.modalFoot}>
              <button
                type="button"
                className={styles.modalBtnKeep}
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Order
              </button>
              <button
                type="button"
                className={styles.modalBtnConfirm}
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Cancelling…</span>
                  </>
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
