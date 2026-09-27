"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, AlertCircle, Loader2 } from 'lucide-react';
import styles from './Invoice.module.css';
import { orderService } from '@/services/orderService';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    document.title = `Invoice #${orderId} | KickAt`;

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getOrderInvoice(orderId);
        if (res.success && res.invoice) {
          setInvoice(res.invoice);
        } else {
          setError('Invoice could not be found for this order.');
        }
      } catch (err: any) {
        console.error('Failed to load invoice:', err);
        setError(err?.message || 'Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!orderId || isDownloading) return;
    setIsDownloading(true);
    try {
      await orderService.downloadInvoicePdf(orderId, invoice?.orderNumber || orderId);
    } catch (err: any) {
      console.error('Failed to download invoice PDF:', err);
      alert('Could not download PDF. You can also use the Print button to save as PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.actions}>
            <Skeleton style={{ height: '40px', width: '140px', borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Skeleton style={{ height: '40px', width: '100px', borderRadius: '8px' }} />
              <Skeleton style={{ height: '40px', width: '140px', borderRadius: '8px' }} />
            </div>
          </div>
          <Skeleton style={{ height: '600px', width: '100%', borderRadius: '8px' }} />
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div style={{ 
            background: 'white', 
            padding: '3rem 1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            border: '1px solid #eaeaea',
            margin: '4rem auto',
            maxWidth: '520px'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#FEE2E2', 
              color: '#DC2626', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <AlertCircle size={30} />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>
              Invoice Not Available
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {error || `We could not generate the invoice for order #${orderId}.`}
            </p>
            <Link href={`/orders/${orderId}`}>
              <Button variant="primary" icon={<ArrowLeft size={16} />}>
                Back to Order
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items: any[] = Array.isArray(invoice.items) ? invoice.items : [];
  const billing = invoice.billingAddress || {};
  const summary = invoice.summary || {};

  const formattedDate = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        
        <div className={styles.actions}>
          <Link href={`/orders/${orderId}`} className={styles.btn}>
            <ArrowLeft size={18} /> Back to Order
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btn} onClick={handlePrint} type="button">
              <Printer size={18} /> Print
            </button>
            <button 
              className={styles.btn} 
              onClick={handleDownloadPdf} 
              disabled={isDownloading}
              type="button"
              style={{ background: '#111', color: 'white', borderColor: '#111' }}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <Download size={18} /> Download PDF
                </>
              )}
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
                {summary.gstNumber ? `GSTIN: ${summary.gstNumber}` : 'GSTIN: 27AAAAA0000A1Z5'}
              </div>
            </div>
            <div>
              <h1 className={styles.invoiceTitle}>INVOICE</h1>
              <div className={styles.invoiceMeta}>
                <strong>Invoice Number:</strong> {invoice.invoiceNumber || `INV-${invoice.orderNumber}`}<br />
                <strong>Order Number:</strong> #{invoice.orderNumber || orderId}<br />
                <strong>Date of Issue:</strong> {formattedDate}
              </div>
            </div>
          </header>

          <div className={styles.addresses}>
            <div className={styles.addressBlock}>
              <h3>Billed To</h3>
              <p>
                <strong>{billing.name || billing.fullName || 'Customer'}</strong><br />
                {billing.houseFlat ? `${billing.houseFlat}, ` : ''}
                {billing.buildingStreet || 'Address on record'}<br />
                {billing.landmark ? `Near ${billing.landmark}, ` : ''}
                {billing.city || ''}{billing.state ? `, ${billing.state}` : ''}<br />
                {billing.country || 'India'}{billing.pincode ? ` - ${billing.pincode}` : ''}
              </p>
            </div>
            <div className={styles.addressBlock}>
              <h3>Shipped To</h3>
              <p>
                <strong>{billing.name || billing.fullName || 'Customer'}</strong><br />
                {billing.houseFlat ? `${billing.houseFlat}, ` : ''}
                {billing.buildingStreet || 'Address on record'}<br />
                {billing.landmark ? `Near ${billing.landmark}, ` : ''}
                {billing.city || ''}{billing.state ? `, ${billing.state}` : ''}<br />
                {billing.country || 'India'}{billing.pincode ? ` - ${billing.pincode}` : ''}
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
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>
                    <strong>{item.productName || 'Item'}</strong>
                    {item.variantName && (
                      <>
                        <br />
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>
                          Variant: {item.variantName}
                        </span>
                      </>
                    )}
                  </td>
                  <td className={styles.right}>{item.quantity}</td>
                  <td className={styles.right}>
                    ₹{Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={styles.right}>
                    ₹{Number(item.totalPrice || (item.price * item.quantity) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{Number(summary.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>
                {Number(summary.deliveryFee || 0) === 0 
                  ? 'FREE' 
                  : `₹${Number(summary.deliveryFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            {Number(summary.codFee || 0) > 0 && (
              <div className={styles.summaryRow}>
                <span>COD Fee</span>
                <span>₹{Number(summary.codFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {Number(summary.extraFeeAmount || 0) > 0 && (
              <div className={styles.summaryRow}>
                <span>{summary.extraFeeName || 'Extra Fee'}</span>
                <span>₹{Number(summary.extraFeeAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {Number(summary.gstAmount || summary.taxAmount || 0) > 0 && (
              <div className={styles.summaryRow}>
                <span>GST {summary.gstPercentage ? `(${summary.gstPercentage}%)` : ''}</span>
                <span>₹{Number(summary.gstAmount || summary.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {Number(summary.discountAmount || 0) > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount Applied</span>
                <span style={{ color: '#15803D' }}>
                  -₹{Number(summary.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{Number(summary.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ textAlign: 'right', marginTop: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
              Amount {invoice.paymentStatus === 'PAID' ? 'paid' : 'due'} via {invoice.paymentMethod || 'Online Payment'}
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
