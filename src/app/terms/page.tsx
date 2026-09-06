import Link from 'next/link';
import { ArrowLeft, Scale, FileCheck, ShoppingBag, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | KickAt',
  description: 'Review the terms and conditions governing the use of KickAt pet e-commerce platform.',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 6rem', minHeight: '70vh' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#FD802E', fontWeight: 600, marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Scale size={36} color="#FD802E" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#233D4C' }}>Terms of Service</h1>
      </div>
      <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
        Last updated: September 2026
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: '#374151' }}>
        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileCheck size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>1. Agreement to Terms</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            By accessing or purchasing from KickAt, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our services.
          </p>
        </section>

        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShoppingBag size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>2. Product Listings & Pricing</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            All product specifications, pricing, and availability are subject to change without notice. We make every effort to display accurate images and details of our pet products. Prices are listed in INR (₹) inclusive of applicable taxes.
          </p>
        </section>

        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldAlert size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>3. User Conduct & Accounts</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            You are responsible for maintaining the confidentiality of your account password and restricting access to your device. KickAt reserves the right to cancel orders or terminate accounts if unauthorized activity is suspected.
          </p>
        </section>
      </div>
    </div>
  );
}
