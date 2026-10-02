"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Shield, Sparkles, ArrowLeft } from 'lucide-react';
import accountStyles from '../Account.module.css';
import styles from './Settings.module.css';

function SettingsContent() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    analytics: true
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggle = (key: 'twoFactor' | 'analytics') => {
    setPrivacy(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      triggerToast('Privacy preference updated!');
      return updated;
    });
  };

  return (
    <>
      {toastMsg && (
        <div className={accountStyles.toastNotification}>
          <Sparkles size={18} color="#F99205" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Back to Account Link */}
      <div className={accountStyles.backHeaderGroup}>
        <Link href="/account" className={accountStyles.backToAccountBtn}>
          <ArrowLeft size={18} />
          <span>Back to Account</span>
        </Link>
      </div>

      <div className={accountStyles.sectionBlockCard}>
        <div className={accountStyles.sectionBlockHeader}>
          <div>
            <h1 className={accountStyles.blockTitle}>Preferences &amp; Settings</h1>
            <p className={accountStyles.blockSubtitle}>Manage account privacy and shopping security options.</p>
          </div>
        </div>

        {/* ── SECURITY & PRIVACY ── */}
        <div className={styles.settingBlock} style={{ marginBottom: '24px' }}>
          <div className={styles.blockTitleRow}>
            <div className={styles.iconCircle}>
              <Shield size={18} color="#15803D" />
            </div>
            <div>
              <h2 className={styles.blockTitle}>Security &amp; Privacy</h2>
              <p className={styles.blockSub}>Protect your account access and data analytics preferences.</p>
            </div>
          </div>

          <div className={styles.toggleList}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleTextGroup}>
                <span className={styles.toggleTitle}>Two-Factor Authentication (2FA)</span>
                <span className={styles.toggleDesc}>Require SMS OTP verification whenever signing in from a new device.</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={privacy.twoFactor}
                  onChange={() => handleToggle('twoFactor')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleTextGroup}>
                <span className={styles.toggleTitle}>Personalization &amp; Analytics Cookies</span>
                <span className={styles.toggleDesc}>Allow tailored pet product recommendations based on browsing history.</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={privacy.analytics}
                  onChange={() => handleToggle('analytics')}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading preferences...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
