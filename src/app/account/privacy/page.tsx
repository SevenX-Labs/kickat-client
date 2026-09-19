"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  Shield, AlertTriangle, Trash2, ArrowLeft, Lock, KeyRound, Smartphone, X 
} from 'lucide-react';
import styles from '../Account.module.css';
import settingsStyles from '../settings/Settings.module.css';
import { useAuth } from '@/context/AuthContext';

function PrivacyContent() {
  const { user } = useAuth();
  const [privacyState, setPrivacyState] = useState({
    twoFactor: false,
    analytics: true,
    marketingConsent: true,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const userData = {
    firstName: user?.name?.split(' ')[0] || "KickAt",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "Member",
    email: user?.email || "member@kickat.co.in",
    tier: "Gold Paw VIP",
    points: 1240
  };

  const handleToggle = (key: keyof typeof privacyState) => {
    setPrivacyState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    alert("Account deletion request submitted. Our team will contact you at " + userData.email + " to process this request in accordance with privacy regulations.");
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      
        
          
          {/* Account Sidebar Nav */}
          

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.backHeaderGroup}>
              <Link href="/account" className={styles.backToAccountBtn}>
                <ArrowLeft size={18} />
                <span>Back to Account</span>
              </Link>
            </div>

            <div className={styles.tabContentCard}>
              <div className={styles.sectionHeader}>
                <h1 className={styles.title}>Privacy &amp; Security</h1>
                <p className={styles.subtitle}>Manage your account privacy, authentication, and security preferences.</p>
              </div>

              {/* Security Block */}
              <div className={settingsStyles.settingBlock}>
                <div className={settingsStyles.blockTitleRow}>
                  <div className={settingsStyles.iconCircle}>
                    <Shield size={18} color="#15803D" />
                  </div>
                  <div>
                    <h2 className={settingsStyles.blockTitle}>Account Security</h2>
                    <p className={settingsStyles.blockSub}>Protect your KickAt account access and authentication controls.</p>
                  </div>
                </div>

                <div className={settingsStyles.toggleList}>
                  <div className={settingsStyles.toggleRow}>
                    <div className={settingsStyles.toggleTextGroup}>
                      <span className={settingsStyles.toggleTitle}>Two-Factor Authentication (2FA)</span>
                      <span className={settingsStyles.toggleDesc}>Require SMS OTP verification whenever signing in from a new device.</span>
                    </div>
                    <label className={settingsStyles.switch}>
                      <input 
                        type="checkbox" 
                        checked={privacyState.twoFactor}
                        onChange={() => handleToggle('twoFactor')}
                      />
                      <span className={settingsStyles.slider}></span>
                    </label>
                  </div>

                  <div className={settingsStyles.toggleRow}>
                    <div className={settingsStyles.toggleTextGroup}>
                      <span className={settingsStyles.toggleTitle}>Personalization &amp; Analytics Cookies</span>
                      <span className={settingsStyles.toggleDesc}>Allow tailored pet product recommendations based on browsing history.</span>
                    </div>
                    <label className={settingsStyles.switch}>
                      <input 
                        type="checkbox" 
                        checked={privacyState.analytics}
                        onChange={() => handleToggle('analytics')}
                      />
                      <span className={settingsStyles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data & Privacy Block */}
              <div className={settingsStyles.settingBlock}>
                <div className={settingsStyles.blockTitleRow}>
                  <div className={settingsStyles.iconCircle}>
                    <Lock size={18} color="#F99205" />
                  </div>
                  <div>
                    <h2 className={settingsStyles.blockTitle}>Data Rights &amp; Preferences</h2>
                    <p className={settingsStyles.blockSub}>Your personal information is kept strictly confidential under our Privacy Policy.</p>
                  </div>
                </div>

                <div className={settingsStyles.toggleList}>
                  <div className={settingsStyles.toggleRow}>
                    <div className={settingsStyles.toggleTextGroup}>
                      <span className={settingsStyles.toggleTitle}>Marketing &amp; Promotional Consent</span>
                      <span className={settingsStyles.toggleDesc}>Receive exclusive VIP discount coupons, new pet product launches, and seasonal offers.</span>
                    </div>
                    <label className={settingsStyles.switch}>
                      <input 
                        type="checkbox" 
                        checked={privacyState.marketingConsent}
                        onChange={() => handleToggle('marketingConsent')}
                      />
                      <span className={settingsStyles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className={settingsStyles.dangerBlock}>
                <div className={settingsStyles.dangerHeader}>
                  <AlertTriangle size={20} color="#B91C1C" />
                  <div>
                    <h3 className={settingsStyles.dangerTitle}>Danger Zone</h3>
                    <p className={settingsStyles.dangerDesc}>Permanently close your KickAt member profile and remove saved data.</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  className={settingsStyles.deleteAccountBtn}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 size={15} /> Deactivate / Delete Account
                </button>
              </div>

            </div>
          </div>

          {/* Right VIP Snapshot */}
          <aside className={styles.statsPanel}>
            <div className={styles.vipCardHeader}>
              <span className={styles.vipCardTitle}>KICKAT REWARDS</span>
              <span className={styles.vipTierTag}>{userData.tier}</span>
            </div>
            <div className={styles.rewardsProgressBlock}>
              <div className={styles.pointsDisplayRow}>
                <span className={styles.pointsValue}>{userData.points.toLocaleString()}</span>
                <span className={styles.pointsLabel}>Available Paws</span>
              </div>
              <div className={styles.tierProgressBarWrapper}>
                <div className={styles.tierProgressBarFill} style={{ width: '62%' }}></div>
              </div>
              <div className={styles.tierProgressText}>
                <span>620 pts earned</span>
                <span>260 pts to Platinum</span>
              </div>
            </div>
          </aside>

        

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <AlertTriangle size={20} color="#B91C1C" />
                <h2>Deactivate Account</h2>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#555047', lineHeight: 1.5 }}>
              Are you sure you want to deactivate your KickAt account? You will lose access to <strong>1,240 VIP Reward Points</strong>, order history tracking, and saved delivery addresses.
            </div>

            <div className={styles.modalFooterActions}>
              <button type="button" className={styles.actionBtn} onClick={() => setIsDeleteModalOpen(false)}>
                Keep Account
              </button>
              <button 
                type="button" 
                className={settingsStyles.confirmDeleteBtn}
                onClick={handleDeleteAccount}
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading privacy settings...</div>}>
      <PrivacyContent />
    </Suspense>
  );
}
