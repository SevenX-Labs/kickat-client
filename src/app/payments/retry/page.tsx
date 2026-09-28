"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CreditCard,
  Smartphone,
  QrCode,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Wallet,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { loadRazorpayScript } from '@/utils/razorpay';
import { PaymentMethodType, RazorpayOptions } from '@/types/payment';
import styles from './PaymentRetry.module.css';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function PaymentRetryContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState<any | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
  const [orderFetchError, setOrderFetchError] = useState<string | null>(null);

  const [method, setMethod] = useState<PaymentMethodType>('upi');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real order details on load
  useEffect(() => {
    if (!orderId) {
      setIsLoadingOrder(false);
      setOrderFetchError('No order ID provided. Please navigate from your Orders page.');
      return;
    }

    async function fetchOrder() {
      try {
        setIsLoadingOrder(true);
        setOrderFetchError(null);
        const res = await orderService.getOrderById(orderId);
        if (res?.order) {
          setOrder(res.order);
          if (res.order.paymentStatus === 'COMPLETED') {
            setIsSuccess(true);
          }
        } else {
          setOrderFetchError('Order not found');
        }
      } catch (err: any) {
        console.error('[Payment Retry] Failed to load order:', err);
        setOrderFetchError(err?.message || 'Could not fetch order details');
      } finally {
        setIsLoadingOrder(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handleRetry = async () => {
    if (!order || !orderId || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const idempotencyKey = generateUUID();

    try {
      // 1. Call Backend Retry API
      const res = await paymentService.retryPayment(
        {
          orderId,
          paymentMethod: method,
          upiId: method === 'upi' ? 'qr@razorpay' : undefined,
        },
        idempotencyKey
      );

      // 2. Check if Razorpay online flow is required
      if (res.razorpayOrderId && res.key) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error('Could not load payment gateway SDK. Please check your internet connection.');
        }

        const options: RazorpayOptions = {
          key: res.key,
          amount: Math.round((res.amount || order.grandTotal || 0) * 100),
          currency: res.currency || 'INR',
          name: 'KickAt',
          description: `Order ${order.orderNumber || ''}`,
          order_id: res.razorpayOrderId,
          handler: async (rzpRes) => {
            setIsProcessing(true);
            try {
              const verifyRes = await paymentService.verifyPayment({
                orderId,
                razorpayOrderId: rzpRes.razorpay_order_id,
                razorpayPaymentId: rzpRes.razorpay_payment_id,
                signature: rzpRes.razorpay_signature,
              });

              if (verifyRes.success) {
                setIsSuccess(true);
              } else {
                throw new Error('Payment verification could not be confirmed.');
              }
            } catch (verifyErr: any) {
              console.error('[Payment Retry] Verification failed:', verifyErr);
              setErrorMessage(verifyErr?.message || 'Payment verification failed. Please check order status.');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: order.address?.name || undefined,
            contact: order.address?.phone || undefined,
          },
          theme: {
            color: '#E7A03B',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setErrorMessage('Payment was cancelled or closed. You can retry anytime.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (res.success) {
        // Direct / COD retry confirmation
        setIsSuccess(true);
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('[Payment Retry] Retry failed:', err);
      setErrorMessage(err?.message || 'Payment retry failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoadingOrder) {
    return (
      <main className={styles.main}>
        <div className={styles.container} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="#E7A03B" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Loading order payment details...</p>
        </div>
      </main>
    );
  }

  if (orderFetchError || !order) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.failedIcon}>
              <AlertCircle size={32} />
            </div>
            <h1 className={styles.title}>Order Not Found</h1>
            <p className={styles.subtitle}>
              {orderFetchError || 'Unable to load payment details for this order.'}
            </p>
          </div>
          <div className={styles.footer}>
            <Link href="/orders" className={styles.retryBtn} style={{ textDecoration: 'none' }}>
              <ArrowLeft size={18} /> Go to My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const grandTotal = Number(order.grandTotal ?? order.totalAmount ?? order.total ?? 0);
  const subtotal = Number(order.subtotal ?? grandTotal);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const firstItemName = order.items?.[0]?.productName || order.items?.[0]?.product?.name || 'Order Items';
  const additionalItemsCount = (order.items?.length || 1) - 1;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {!isSuccess ? (
          <>
            <div className={styles.header}>
              <div className={styles.failedIcon}>
                <AlertCircle size={32} />
              </div>
              <h1 className={styles.title}>Payment Required</h1>
              <p className={styles.subtitle}>
                Complete payment for order <strong>#{order.orderNumber || order.id}</strong> to confirm your purchase.
              </p>
            </div>

            <div className={styles.body}>
              {errorMessage && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '10px',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                  lineHeight: 1.4,
                }}>
                  {errorMessage}
                </div>
              )}

              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}>
                  <span>Order</span>
                  <span style={{ fontWeight: 500, color: '#111' }}>#{order.orderNumber || order.id}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Item</span>
                  <span style={{ fontWeight: 500, color: '#111' }}>
                    {firstItemName} {additionalItemsCount > 0 ? `+ ${additionalItemsCount} more` : ''}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toLocaleString()}`}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Amount Due</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Choose Payment Method</div>
              <div className={styles.radioGrid}>
                <label className={`${styles.radioCard} ${method === 'upi' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    className={styles.radioInput}
                    checked={method === 'upi'}
                    onChange={() => setMethod('upi')}
                  />
                  <QrCode size={20} color={method === 'upi' ? '#E7A03B' : '#666'} />
                  <div>
                    <div className={styles.methodLabel}>UPI QR Code &amp; Apps</div>
                    <div className={styles.methodDesc}>Dynamic QR, Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </label>

                <label className={`${styles.radioCard} ${method === 'card' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    className={styles.radioInput}
                    checked={method === 'card'}
                    onChange={() => setMethod('card')}
                  />
                  <CreditCard size={20} color={method === 'card' ? '#E7A03B' : '#666'} />
                  <div>
                    <div className={styles.methodLabel}>Credit / Debit Card</div>
                    <div className={styles.methodDesc}>Visa, Mastercard, RuPay, Maestro</div>
                  </div>
                </label>

                <label className={`${styles.radioCard} ${method === 'netbanking' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    className={styles.radioInput}
                    checked={method === 'netbanking'}
                    onChange={() => setMethod('netbanking')}
                  />
                  <Building2 size={20} color={method === 'netbanking' ? '#E7A03B' : '#666'} />
                  <div>
                    <div className={styles.methodLabel}>Net Banking</div>
                    <div className={styles.methodDesc}>All Indian Banks Supported</div>
                  </div>
                </label>

                <label className={`${styles.radioCard} ${method === 'wallet' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    className={styles.radioInput}
                    checked={method === 'wallet'}
                    onChange={() => setMethod('wallet')}
                  />
                  <Wallet size={20} color={method === 'wallet' ? '#E7A03B' : '#666'} />
                  <div>
                    <div className={styles.methodLabel}>Wallets</div>
                    <div className={styles.methodDesc}>Paytm, Amazon Pay, Mobikwik</div>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.retryBtn} onClick={handleRetry} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Retry Payment — ₹{grandTotal.toLocaleString()}
                  </>
                )}
              </button>
              <Link href="/orders" className={styles.cancelLink}>
                Cancel and go to My Orders
              </Link>
            </div>
          </>
        ) : (
          <div className={styles.successOverlay}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={36} />
            </div>
            <h2 className={styles.successTitle}>Payment Successful!</h2>
            <p className={styles.successText}>
              Your payment of ₹{grandTotal.toLocaleString()} for order #{order.orderNumber || order.id} has been verified and confirmed.
            </p>
            <Link href={`/orders/${order.id}`} className={styles.successBtn}>
              View Order Details
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentRetryPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.main}>
          <div className={styles.container} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <Loader2 size={36} className="animate-spin" color="#E7A03B" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#666', fontSize: '0.95rem' }}>Loading...</p>
          </div>
        </main>
      }
    >
      <PaymentRetryContent />
    </Suspense>
  );
}
