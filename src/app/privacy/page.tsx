import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import styles from '../contact/Contact.module.css';

export const metadata = {
  title: 'Privacy Policy | KickAt',
  description: 'Learn how KickAt handles and protects your personal data and privacy.',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 6rem', minHeight: '70vh' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#F99205', fontWeight: 600, marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <ShieldCheck size={36} color="#F99205" />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#233D4C' }}>Privacy Policy</h1>
      </div>
      <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
        Last updated: September 2026
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: '#374151' }}>
        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lock size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>1. Information We Collect</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            We collect personal information that you provide to us directly when creating an account, making a purchase, subscribing to our newsletter, or contacting customer support. This includes your name, email address, shipping address, payment details, and pet profiles.
          </p>
        </section>

        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Eye size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>2. How We Use Your Information</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            Your information is used strictly to fulfill your orders, provide personalized pet product recommendations, communicate order updates, improve our services, and ensure security. We never sell your personal data to third parties.
          </p>
        </section>

        <section style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileText size={20} color="#233D4C" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#233D4C' }}>3. Data Security & Cookies</h2>
          </div>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            We implement industry-standard SSL encryption and secure cloud infrastructure to safeguard your information. Cookies are used to maintain your active cart, save your preferences, and provide a seamless checkout experience.
          </p>
        </section>

        <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#FFF5EE', borderRadius: '12px', border: '1px solid #FDBA74' }}>
          <p style={{ color: '#C2410C', fontWeight: 600, fontSize: '0.9rem' }}>
            Have questions about your privacy rights? Reach out to our Data Privacy Officer at <Link href="/contact" style={{ color: '#F99205', textDecoration: 'underline' }}>support@kickat.com</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
