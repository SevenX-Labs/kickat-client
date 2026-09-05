"use client";

import { useState, Suspense } from 'react';
import { 
  Bell, Shield, Trash2, Sparkles, AlertTriangle, X
} from 'lucide-react';
import accountStyles from '../Account.module.css';
import styles from './Settings.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';

const initialUserData = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  memberSince: '2025',
  totalOrders: 12,
  points: 1240,
  tier: 'Gold Paw VIP',
};

function SettingsContent() {
  const [userData] = useState(initialUserData);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Preference States
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    blogDigest: false,
    smsWhatsapp: true
  });

  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    analytics: true
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggle = (category: 'notifications' | 'privacy', key: string) => {
    if (category === 'notifications') {
      setNotifications(prev => {
        const updated = { ...prev, [key]: !prev[key as keyof typeof prev] };
        triggerToast('Notification preferences updated!');
        return updated;
      });
    } else {
      setPrivacy(prev => {
        const updated = { ...prev, [key]: !prev[key as keyof typeof prev] };
        triggerToast('Privacy setting updated!');
        return updated;
      });
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(false);
    triggerToast('Account deletion request submitted.');
  };

  return (
    <div className={accountStyles.pageWrapper}>
      {toastMsg && (
        <div className={accountStyles.toastBanner}>
          <Sparkles size={18} className={accountStyles.toastIcon} />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className={accountStyles.container}>
        <div className={accountStyles.accountLayout}>
          
          {/* Account Sidebar Nav */}
          <AccountSidebarNav user={userData} />

          {/* Main Content Area */}
          <div className={accountStyles.contentArea}>
            <div className={accountStyles.tabContentCard}>
              <div className={accountStyles.sectionHeader}>
                <h1 className={accountStyles.title}>Preferences &amp; Settings</h1>
                <p className={accountStyles.subtitle}>Customize notification alerts, shopping defaults, and account privacy options.</p>
              </div>

              {/* ── NOTIFICATION PREFERENCES ── */}
              <div className={styles.settingBlock}>
                <div className={styles.blockTitleRow}>
                  <div className={styles.iconCircle}>
                    <Bell size={18} color="#FD802E" />
                  </div>
                  <div>
                    <h2 className={styles.blockTitle}>Notifications &amp; Alerts</h2>
                    <p className={styles.blockSub}>Choose how KickAt communicates order progress and offers with you.</p>
                  </div>
                </div>

                <div className={styles.toggleList}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleTextGroup}>
                      <span className={styles.toggleTitle}>Order Tracking &amp; Delivery Updates</span>
                      <span className={styles.toggleDesc}>Receive real-time email &amp; WhatsApp alerts when items ship or arrive.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.orderUpdates}
                        onChange={() => handleToggle('notifications', 'orderUpdates')}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleTextGroup}>
                      <span className={styles.toggleTitle}>SMS &amp; WhatsApp Alerts</span>
                      <span className={styles.toggleDesc}>Get instant mobile text alerts for dispatch and delivery partner updates.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.smsWhatsapp}
                        onChange={() => handleToggle('notifications', 'smsWhatsapp')}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleTextGroup}>
                      <span className={styles.toggleTitle}>VIP Offers &amp; Price Drop Alerts</span>
                      <span className={styles.toggleDesc}>Exclusive discounts, cash-back rewards, and seasonal sale early access.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.promotions}
                        onChange={() => handleToggle('notifications', 'promotions')}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleTextGroup}>
                      <span className={styles.toggleTitle}>Pet Care Tips &amp; Blog Newsletter</span>
                      <span className={styles.toggleDesc}>Weekly curated articles on pet nutrition, training, and wellness guide.</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.blogDigest}
                        onChange={() => handleToggle('notifications', 'blogDigest')}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>



              {/* ── SECURITY & PRIVACY ── */}
              <div className={styles.settingBlock}>
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
                        onChange={() => handleToggle('privacy', 'twoFactor')}
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
                        onChange={() => handleToggle('privacy', 'analytics')}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── DANGER ZONE ── */}
              <div className={styles.dangerBlock}>
                <div className={styles.dangerHeader}>
                  <AlertTriangle size={20} color="#B91C1C" />
                  <div>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <p className={styles.dangerDesc}>Permanently close your KickAt member profile and remove saved data.</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  className={styles.deleteAccountBtn}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 size={15} /> Deactivate / Delete Account
                </button>
              </div>

            </div>
          </div>

          {/* Right VIP Snapshot */}
          <aside className={accountStyles.statsPanel}>
            <div className={accountStyles.vipCardHeader}>
              <span className={accountStyles.vipCardTitle}>KICKAT REWARDS</span>
              <span className={accountStyles.vipTierTag}>{userData.tier}</span>
            </div>
            <div className={accountStyles.rewardsProgressBlock}>
              <div className={accountStyles.pointsDisplayRow}>
                <span className={accountStyles.pointsValue}>{userData.points.toLocaleString()}</span>
                <span className={accountStyles.pointsLabel}>Available Paws</span>
              </div>
              <div className={accountStyles.tierProgressBarWrapper}>
                <div className={accountStyles.tierProgressBarFill} style={{ width: '62%' }}></div>
              </div>
              <div className={accountStyles.tierProgressText}>
                <span>620 pts earned</span>
                <span>260 pts to Platinum</span>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* ── DELETE ACCOUNT CONFIRMATION MODAL ── */}
      {isDeleteModalOpen && (
        <div className={accountStyles.modalBackdrop} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={accountStyles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={accountStyles.modalHeader}>
              <div className={accountStyles.modalTitleGroup}>
                <AlertTriangle size={20} color="#B91C1C" />
                <h2>Deactivate Account</h2>
              </div>
              <button type="button" className={accountStyles.modalCloseBtn} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#555047', lineHeight: 1.5 }}>
              Are you sure you want to deactivate your KickAt account? You will lose access to <strong>1,240 VIP Reward Points</strong>, order history tracking, and saved delivery addresses.
            </div>

            <div className={accountStyles.modalFooterActions}>
              <button type="button" className={accountStyles.actionBtn} onClick={() => setIsDeleteModalOpen(false)}>
                Keep Account
              </button>
              <button 
                type="button" 
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteAccount}
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading preferences...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
