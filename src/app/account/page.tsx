"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Calendar, CreditCard, ShieldCheck, 
  CheckCircle2, Edit3, Lock, Sparkles, Award, X, Eye, EyeOff
} from 'lucide-react';
import styles from './Account.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';

const initialUserData = {
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah.j@example.com',
  phone: '+91 98765 43210',
  memberSince: '2025',
  totalOrders: 12,
  points: 1240,
  tier: 'Gold Paw VIP',
  currency: 'INR (₹)'
};

function AccountProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');

  // Handle URL redirects for tab search params
  useEffect(() => {
    if (tab === 'orders') {
      router.replace('/account/orders');
    } else if (tab === 'addresses') {
      router.replace('/account/addresses');
    } else if (tab === 'payments' || tab === 'payment-methods') {
      router.replace('/account/payment-methods');
    } else if (tab === 'wishlist') {
      router.replace('/wishlist');
    }
  }, [tab, router]);

  const [userData, setUserData] = useState(initialUserData);

  // Modals & Toast State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserData(prev => ({
      ...prev,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      email: profileForm.email,
      phone: profileForm.phone
    }));
    setIsEditProfileOpen(false);
    triggerToast('Profile information updated successfully!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangePasswordOpen(false);
    triggerToast('Account password changed successfully!');
  };

  return (
    <div className={styles.pageWrapper}>
      {toastMsg && (
        <div className={styles.toastBanner}>
          <Sparkles size={18} className={styles.toastIcon} />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className={styles.container}>
        <div className={styles.accountLayout}>
          
          {/* Shared Account Navigation */}
          <AccountSidebarNav user={userData} />

          {/* Profile Details Content Card */}
          <div className={styles.contentArea}>
            <div className={styles.tabContentCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.headerTitleRow}>
                  <div>
                    <h1 className={styles.title}>Profile Details</h1>
                    <p className={styles.subtitle}>Manage your personal identity, contact preferences, and security settings.</p>
                  </div>
                  <div className={styles.vipBadgeHeader}>
                    <Award size={16} color="#FD802E" />
                    <span>{userData.tier}</span>
                  </div>
                </div>
              </div>

              <div className={styles.profileDetailsGrid}>
                {/* Full Name */}
                <div className={styles.detailFieldBlock}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldIconCircle}>
                      <User size={16} color="#FD802E" />
                    </div>
                    <span className={styles.fieldLabel}>Full Name</span>
                  </div>
                  <span className={styles.fieldValue}>{userData.firstName} {userData.lastName}</span>
                </div>

                {/* Email Address */}
                <div className={styles.detailFieldBlock}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldIconCircle}>
                      <Mail size={16} color="#FD802E" />
                    </div>
                    <span className={styles.fieldLabel}>Email Address</span>
                  </div>
                  <span className={styles.fieldValue}>{userData.email}</span>
                </div>

                {/* Phone Number */}
                <div className={styles.detailFieldBlock}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldIconCircle}>
                      <Phone size={16} color="#FD802E" />
                    </div>
                    <span className={styles.fieldLabel}>Phone Number</span>
                  </div>
                  <span className={styles.fieldValue}>{userData.phone}</span>
                </div>

                {/* Member Since */}
                <div className={styles.detailFieldBlock}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldIconCircle}>
                      <Calendar size={16} color="#FD802E" />
                    </div>
                    <span className={styles.fieldLabel}>Member Since</span>
                  </div>
                  <span className={styles.fieldValue}>{userData.memberSince}</span>
                </div>

                {/* Preferred Currency */}
                <div className={styles.detailFieldBlock}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldIconCircle}>
                      <CreditCard size={16} color="#FD802E" />
                    </div>
                    <span className={styles.fieldLabel}>Preferred Currency</span>
                  </div>
                  <span className={styles.fieldValue}>{userData.currency}</span>
                </div>

                {/* Account Security */}
                <div className={styles.detailFieldBlock}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldIconCircle}>
                      <ShieldCheck size={16} color="#15803D" />
                    </div>
                    <span className={styles.fieldLabel}>Account Status</span>
                  </div>
                  <div className={styles.verifiedBadge}>
                    <CheckCircle2 size={13} /> Verified KickAt Member
                  </div>
                </div>
              </div>

              <div className={styles.tabActionFooter}>
                <button 
                  type="button" 
                  className={styles.primaryBtn}
                  onClick={() => {
                    setProfileForm({
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      email: userData.email,
                      phone: userData.phone
                    });
                    setIsEditProfileOpen(true);
                  }}
                >
                  <Edit3 size={15} /> Edit Information
                </button>
                
                <button 
                  type="button" 
                  className={styles.actionBtn}
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <Lock size={15} /> Change Password
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

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsEditProfileOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <Edit3 size={20} color="#FD802E" />
                <h2>Edit Personal Details</h2>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setIsEditProfileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.modalInput}
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Last Name</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.modalInput}
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  className={styles.modalInput}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className={styles.modalInput}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" className={styles.actionBtn} onClick={() => setIsEditProfileOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsChangePasswordOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <Lock size={20} color="#FD802E" />
                <h2>Change Security Password</h2>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setIsChangePasswordOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Current Password</label>
                <div className={styles.pwInputWrapper}>
                  <input 
                    type={showCurrentPw ? "text" : "password"} 
                    required 
                    className={styles.modalInput}
                    placeholder="Enter existing password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className={styles.pwToggleBtn}
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>New Password</label>
                <div className={styles.pwInputWrapper}>
                  <input 
                    type={showNewPw ? "text" : "password"} 
                    required 
                    minLength={6}
                    className={styles.modalInput}
                    placeholder="Minimum 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className={styles.pwToggleBtn}
                    onClick={() => setShowNewPw(!showNewPw)}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  className={styles.modalInput}
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" className={styles.actionBtn} onClick={() => setIsChangePasswordOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading profile details...</div>}>
      <AccountProfileContent />
    </Suspense>
  );
}
