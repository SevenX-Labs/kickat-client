"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CreditCard,
  QrCode,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Wallet,
  Loader2,
  ArrowLeft,
  PackageCheck,
  Lock,
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
          if (res.order.paymentStatus === 'COMPLETED' || res.order.status === 'CONFIRMED') {
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
      const res = await paymentService.retryPayment(
        {
          orderId,
          paymentMethod: method,
          upiId: method === 'upi' ? 'qr@razorpay' : undefined,
        },
        idempotencyKey
      );

      if (res.razorpayOrderId && res.key) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error('Could not load payment gateway SDK. Please check your connection.');
        }

        const options: RazorpayOptions = {
          key: res.key,
          amount: Math.round((res.amount || order.grandTotal || 0) * 100),
          currency: res.currency || 'INR',
          name: 'KickAt',
          description: `Order #${order.orderNumber || order.id?.slice(0, 8)}`,
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
            color: '#F99205',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              setErrorMessage('Payment was cancelled. You can select another method or retry anytime.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (res.success) {
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
      <main className={styles.pageWrapper}>
        <div className={styles.main}>
          <div className={styles.container} style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Loader2 size={36} color="#F99205" style={{ margin: '0 auto 1.25rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#4B5563', fontSize: '0.95rem', fontWeight: 500 }}>Loading order details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (orderFetchError || !order) {
    return (
      <main className={styles.pageWrapper}>
        <div className={styles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.failedIcon}>
                <AlertCircle size={28} />
              </div>
              <h1 className={styles.title}>Order Lookup Failed</h1>
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
        </div>
      </main>
    );
  }

  const grandTotal = Number(order.grandTotal ?? order.totalAmount ?? order.total ?? 0);
  const subtotal = Number(order.subtotal ?? grandTotal);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const items = order.items || [];
  const firstItemName = items[0]?.productName || items[0]?.product?.name || 'Pet Item';
  const additionalCount = items.length > 1 ? items.length - 1 : 0;

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <div className={styles.container}>
          {!isSuccess ? (
            <>
              <div className={styles.header}>
                <div className={styles.failedIcon}>
                  <AlertCircle size={28} />
                </div>
                <h1 className={styles.title}>Payment Required</h1>
                <p className={styles.subtitle}>
                  Complete payment for order <strong>#{order.orderNumber || order.id}</strong> to confirm your purchase.
                </p>
              </div>

              <div className={styles.body}>
                {errorMessage && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    color: '#991B1B',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    lineHeight: 1.45,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>{errorMessage}</div>
                  </div>
                )}

                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Order ID</span>
                    <span className={styles.summaryValue}>#{order.orderNumber || order.id}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Items</span>
                    <span className={styles.summaryValue}>
                      {firstItemName}
                      {additionalCount > 0 && <span style={{ color: '#F99205' }}> +{additionalCount} more</span>}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Subtotal</span>
                    <span className={styles.summaryValue}>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Delivery</span>
                    <span className={styles.summaryValue} style={{ color: deliveryFee === 0 ? '#16A34A' : '#111827' }}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Amount Due</span>
                    <span className={styles.totalAmount}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.sectionLabel}>Select Payment Method</div>
                <div className={styles.radioGrid}>
                  {/* UPI */}
                  <div
                    className={`${styles.radioCard} ${method === 'upi' ? styles.selected : ''}`}
                    onClick={() => setMethod('upi')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.radioIconWrap}>
                      <QrCode size={20} />
                    </div>
                    <div className={styles.methodDetails}>
                      <div className={styles.methodLabelRow}>
                        <span className={styles.methodLabel}>UPI / QR Code</span>
                        <span className={styles.recommendedTag}>Fastest</span>
                      </div>
                      <div className={styles.methodDesc}>GPay, PhonePe, Paytm, BHIM & UPI QR</div>
                    </div>
                    <div className={styles.radioCircle}>
                      {method === 'upi' && <div className={styles.radioDot} />}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`${styles.radioCard} ${method === 'card' ? styles.selected : ''}`}
                    onClick={() => setMethod('card')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.radioIconWrap}>
                      <CreditCard size={20} />
                    </div>
                    <div className={styles.methodDetails}>
                      <div className={styles.methodLabelRow}>
                        <span className={styles.methodLabel}>Debit / Credit Card</span>
                      </div>
                      <div className={styles.methodDesc}>Visa, MasterCard, RuPay, Maestro</div>
                    </div>
                    <div className={styles.radioCircle}>
                      {method === 'card' && <div className={styles.radioDot} />}
                    </div>
                  </div>

                  {/* Netbanking */}
                  <div
                    className={`${styles.radioCard} ${method === 'netbanking' ? styles.selected : ''}`}
                    onClick={() => setMethod('netbanking')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.radioIconWrap}>
                      <Building2 size={20} />
                    </div>
                    <div className={styles.methodDetails}>
                      <div className={styles.methodLabelRow}>
                        <span className={styles.methodLabel}>Net Banking</span>
                      </div>
                      <div className={styles.methodDesc}>All 50+ major Indian banks supported</div>
                    </div>
                    <div className={styles.radioCircle}>
                      {method === 'netbanking' && <div className={styles.radioDot} />}
                    </div>
                  </div>

                  {/* Wallets */}
                  <div
                    className={`${styles.radioCard} ${method === 'wallet' ? styles.selected : ''}`}
                    onClick={() => setMethod('wallet')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.radioIconWrap}>
                      <Wallet size={20} />
                    </div>
                    <div className={styles.methodDetails}>
                      <div className={styles.methodLabelRow}>
                        <span className={styles.methodLabel}>Digital Wallets</span>
                      </div>
                      <div className={styles.methodDesc}>Paytm, Amazon Pay, Mobikwik & more</div>
                    </div>
                    <div className={styles.radioCircle}>
                      {method === 'wallet' && <div className={styles.radioDot} />}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <button
                  className={styles.retryBtn}
                  onClick={handleRetry}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Opening Payment Gateway...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={19} />
                      Pay ₹{grandTotal.toLocaleString()} Now
                    </>
                  )}
                </button>

                <Link href="/orders" className={styles.cancelLink}>
                  <ArrowLeft size={15} /> Cancel and return to My Orders
                </Link>

                <div className={styles.securityNote}>
                  <Lock size={12} />
                  <span>256-Bit SSL Encrypted &amp; PCI-DSS Compliant</span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={38} />
              </div>
              <h2 className={styles.successTitle}>Payment Completed!</h2>
              <p className={styles.successText}>
                Thank you! Your payment of <strong>₹{grandTotal.toLocaleString()}</strong> for Order #{order.orderNumber || order.id} was successfully received.
              </p>
              <Link href="/orders" className={styles.successBtn}>
                <PackageCheck size={18} style={{ marginRight: '8px' }} />
                View My Orders
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PaymentRetryPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageWrapper}>
          <main className={styles.main}>
            <div className={styles.container} style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <Loader2 size={36} color="#F99205" style={{ margin: '0 auto 1.25rem', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Loading payment...</p>
            </div>
          </main>
        </div>
      }
    >
      <PaymentRetryContent />
    </Suspense>
  );
}
