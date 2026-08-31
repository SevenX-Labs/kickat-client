"use client";

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import styles from './Invoice.module.css';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id || "ORD-89241";

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        
        <div className={styles.actions}>
          <Link href={`/orders/${orderId}`} className={styles.btn}>
            <ArrowLeft size={18} /> Back to Order
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btn} onClick={handlePrint}>
              <Printer size={18} /> Print
            </button>
            <button className={styles.btn} style={{ background: '#111', color: 'white', borderColor: '#111' }}>
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>

        <div className={styles.invoicePaper}>
          <header className={styles.invoiceHeader}>
            <div>
              <div className={styles.logo}>KickAt.</div>
              <div className={styles.companyInfo}>
                KickAt Ecommerce Ltd.<br />
                100 Retail Park, Andheri East<br />
                Mumbai, Maharashtra 400069<br />
                GSTIN: 27AAAAA0000A1Z5
              </div>
            </div>
            <div>
              <h1 className={styles.invoiceTitle}>INVOICE</h1>
              <div className={styles.invoiceMeta}>
                <strong>Invoice Number:</strong> INV-2026-9912<br />
                <strong>Order Number:</strong> {orderId}<br />
                <strong>Date of Issue:</strong> August 26, 2026
              </div>
            </div>
          </header>

          <div className={styles.addresses}>
            <div className={styles.addressBlock}>
              <h3>Billed To</h3>
              <p>
                <strong>Sarah Jenkins</strong><br />
                123 Pet Lover Lane, Block B<br />
                Near Park, Mumbai<br />
                Maharashtra, 400001
              </p>
            </div>
            <div className={styles.addressBlock}>
              <h3>Shipped To</h3>
              <p>
                <strong>Sarah Jenkins</strong><br />
                123 Pet Lover Lane, Block B<br />
                Near Park, Mumbai<br />
                Maharashtra, 400001
              </p>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Description</th>
                <th className={styles.right}>Qty</th>
                <th className={styles.right}>Unit Price</th>
                <th className={styles.right}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Ceramic Anti-Slip Pet Bowl</strong><br />
                  <span style={{ color: '#666', fontSize: '0.85rem' }}>Color: Matte White</span>
                </td>
                <td className={styles.right}>1</td>
                <td className={styles.right}>₹1,499.00</td>
                <td className={styles.right}>₹1,499.00</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹1,499.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>₹50.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Discount applied</span>
              <span>-₹150.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>IGST (18%)</span>
              <span>Included</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹1,399.00</span>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
              Amount paid via UPI
            </div>
          </div>

          <footer className={styles.footer}>
            Thank you for shopping with KickAt! If you have any questions about this invoice, please contact support@kickat.com.
          </footer>
        </div>

      </div>
    </main>
  );
}
