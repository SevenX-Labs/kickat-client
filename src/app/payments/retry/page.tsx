"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CreditCard, Smartphone, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import styles from './PaymentRetry.module.css';

export default function PaymentRetryPage() {
  const [method, setMethod] = useState('upi');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRetry = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {!isSuccess ? (
          <>
            <div className={styles.header}>
              <div className={styles.failedIcon}>
                <AlertCircle size={32} />
              </div>
              <h1 className={styles.title}>Payment Failed</h1>
              <p className={styles.subtitle}>
                Your last payment attempt was unsuccessful. Please try again with the same or different method.
              </p>
            </div>

            <div className={styles.body}>
              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}>
                  <span>Order</span>
                  <span style={{ fontWeight: 500, color: '#111' }}>#ORD-89241</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Item</span>
                  <span style={{ fontWeight: 500, color: '#111' }}>Ceramic Anti-Slip Pet Bowl</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹1,499</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Amount Due</span>
                  <span>₹1,499</span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Choose Payment Method</div>
              <div className={styles.radioGrid}>
                <label className={`${styles.radioCard} ${method === 'upi' ? styles.selected : ''}`}>
                  <input type="radio" name="method" className={styles.radioInput} checked={method === 'upi'} onChange={() => setMethod('upi')} />
                  <Smartphone size={20} color={method === 'upi' ? '#E7A03B' : '#666'} />
                  <div>
                    <div className={styles.methodLabel}>UPI</div>
                    <div className={styles.methodDesc}>Google Pay, PhonePe, Paytm</div>
                  </div>
                </label>

                <label className={`${styles.radioCard} ${method === 'card' ? styles.selected : ''}`}>
                  <input type="radio" name="method" className={styles.radioInput} checked={method === 'card'} onChange={() => setMethod('card')} />
                  <CreditCard size={20} color={method === 'card' ? '#E7A03B' : '#666'} />
                  <div>
                    <div className={styles.methodLabel}>Credit / Debit Card</div>
                    <div className={styles.methodDesc}>Visa, Mastercard, RuPay</div>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.retryBtn} onClick={handleRetry} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Retry Payment — ₹1,499
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
              Your payment of ₹1,499 has been processed. Your order #ORD-89241 is now confirmed and will be shipped shortly.
            </p>
            <Link href="/orders/ORD-89241" className={styles.successBtn}>
              View Order
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
