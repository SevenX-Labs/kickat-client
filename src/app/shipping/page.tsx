import Link from 'next/link';
import { ArrowLeft, Truck, RefreshCw, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Returns Policy | KickAt',
  description: 'Learn about KickAt fast shipping, tracking, and 30-day hassle-free return policy.',
};

export default function ShippingPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 6rem', minHeight: '70vh' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#F99205', fontWeight: 600, marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Truck size={36} color="#F99205" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#233D4C' }}>Shipping & Returns</h1>
      </div>
      <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
        Everything you need to know about delivery timelines, tracking, and our 30-day return policy.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: '#374151' }}>
        {/* Delivery Options */}
        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Clock size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>Shipping Options & Timelines</h2>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#4B5563', fontSize: '0.95rem', paddingLeft: '1.25rem' }}>
            <li><strong>Standard Shipping (2-4 business days):</strong> Free on all orders over ₹499. Flat ₹49 for orders under ₹499.</li>
            <li><strong>Express Shipping (Next Day):</strong> Available for select metro locations at ₹99.</li>
            <li><strong>Order Processing:</strong> Orders placed before 2:00 PM IST are dispatched on the same business day.</li>
          </ul>
        </section>

        {/* Live Order Tracking */}
        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <MapPin size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>Order Tracking</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '1rem' }}>
            Once your package leaves our fulfillment warehouse, you will receive an SMS & Email containing your live tracking link. You can also view real-time tracking anytime from your KickAt account.
          </p>
          <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F99205', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
            Track Your Order
          </Link>
        </section>

        {/* 30-Day Easy Returns */}
        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <RefreshCw size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>30-Day Hassle-Free Returns</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '1rem' }}>
            We want your pets to be 100% happy! If a product is unused, damaged, or not suitable, request a pickup within 30 days of delivery for a full refund or exchange.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/returns" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#233D4C', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
              Initiate a Return
            </Link>
            <Link href="/faq" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', color: '#233D4C', border: '1px solid #D1D5DB', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
              View Return FAQs
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
