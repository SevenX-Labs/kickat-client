"use client";

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, CheckCircle2, Wallet, CreditCard, ArrowLeft } from 'lucide-react';
import styles from './ReturnFlow.module.css';
import Link from 'next/link';

export default function ReturnFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id || "ORD-89241";
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [refundMethod, setRefundMethod] = useState("wallet");

  const handleNext = () => {
    if (step === 1 && !reason) {
      alert("Please select a reason for return.");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ marginBottom: '1rem' }}>
            <Link href={`/orders/${orderId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
              <ArrowLeft size={14} /> Back to Order
            </Link>
          </div>
          <h1 className={styles.title}>
            {step === 1 && "Why are you returning this?"}
            {step === 2 && "How would you like your refund?"}
            {step === 3 && "Return Requested!"}
          </h1>
          <p className={styles.subtitle}>
            {step === 1 && "Help us understand what went wrong."}
            {step === 2 && "Choose your preferred refund destination."}
            {step === 3 && "We've received your request and will process it shortly."}
          </p>
        </div>

        <div className={styles.formContent}>
          
          {step === 1 && (
            <div>
              <div className={styles.itemCard}>
                <div className={styles.itemImageWrapper}>
                  <Image src="/hero-products/pet_bowl.png" alt="Pet Bowl" fill style={{ objectFit: 'contain', padding: '0.25rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Ceramic Anti-Slip Pet Bowl</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Qty: 1 • ₹1,499</div>
                </div>
              </div>

              <label className={styles.label}>Reason for Return</label>
              <select className={styles.reasonSelect} value={reason} onChange={e => setReason(e.target.value)}>
                <option value="" disabled>Select a reason...</option>
                <option value="damaged">Item arrived damaged or defective</option>
                <option value="wrong_item">Wrong item was delivered</option>
                <option value="quality">Quality not as expected</option>
                <option value="changed_mind">Changed my mind</option>
              </select>

              <label className={styles.label}>Additional Comments (Optional)</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Tell us more about the issue..."
                value={comments}
                onChange={e => setComments(e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <div className={styles.radioGrid}>
                
                <label className={`${styles.radioCard} ${refundMethod === 'wallet' ? styles.selected : ''}`}>
                  <input type="radio" name="refund" className={styles.radioInput} checked={refundMethod === 'wallet'} onChange={() => setRefundMethod('wallet')} />
                  <div style={{ marginTop: '0.15rem' }}><Wallet size={20} color={refundMethod === 'wallet' ? '#E7A03B' : '#666'} /></div>
                  <div className={styles.radioContent}>
                    <h4>KickAt Wallet (Recommended)</h4>
                    <p>Instant refund. Use for your next purchase.</p>
                  </div>
                </label>

                <label className={`${styles.radioCard} ${refundMethod === 'original' ? styles.selected : ''}`}>
                  <input type="radio" name="refund" className={styles.radioInput} checked={refundMethod === 'original'} onChange={() => setRefundMethod('original')} />
                  <div style={{ marginTop: '0.15rem' }}><CreditCard size={20} color={refundMethod === 'original' ? '#E7A03B' : '#666'} /></div>
                  <div className={styles.radioContent}>
                    <h4>Original Payment Method</h4>
                    <p>Takes 3-5 business days to reflect in your account.</p>
                  </div>
                </label>

              </div>
              
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#fafafa', borderRadius: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Refund Amount</span>
                  <span style={{ fontWeight: 600 }}>₹1,499</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.successContainer}>
              <CheckCircle2 size={64} color="#E7A03B" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
              <h2 style={{ marginBottom: '1rem', color: '#111' }}>Return Initiated Successfully</h2>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your return request has been submitted. Our courier partner will pick up the item within 1-2 business days.
              </p>
              <Link href="/returns" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#111', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
                Track Return Status
              </Link>
            </div>
          )}

        </div>

        {step < 3 && (
          <div className={styles.footer}>
            <button className={styles.btnBack} onClick={() => step === 1 ? router.push(`/orders/${orderId}`) : setStep(1)}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button className={styles.btnNext} onClick={handleNext}>
              {step === 2 ? 'Submit Return' : 'Continue'}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
