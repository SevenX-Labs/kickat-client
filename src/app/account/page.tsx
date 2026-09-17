"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Phone, Calendar, ShieldCheck, 
  Edit3, Sparkles, Crown, ChevronRight, Bell, Tag, X, Loader2
} from 'lucide-react';
import styles from './Account.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService';

function AccountProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');
  const { user, setUser } = useAuth();

  // Handle URL redirects for tab search params
  useEffect(() => {
    if (tab === 'orders') {
      router.replace('/account/orders');
    } else if (tab === 'addresses') {
      router.replace('/account/addresses');
    } else if (tab === 'payments' || tab === 'payment-methods') {
      router.replace('/account/payment-methods');
    } else if (tab === 'settings') {
      router.replace('/account/settings');
    } else if (tab === 'wishlist') {
      router.replace('/wishlist');
    }
  }, [tab, router]);

  const [userData, setUserData] = useState({
    firstName: 'KickAt',
    lastName: 'Member',
    email: '',
    phone: '',
    memberSince: '2025',
    totalOrders: 0,
    points: 100,
    tier: 'KickAt VIP',
    currency: 'INR (₹)'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Profile Details | KickAt";
    if (user) {
      const nameParts = (user.name || '').trim().split(' ');
      const firstName = nameParts[0] || (user.email ? user.email.split('@')[0] : (user.phone ? `User_${user.phone.slice(-4)}` : 'KickAt'));
      const lastName = nameParts.slice(1).join(' ') || 'Member';

      setUserData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || 'Not provided',
        phone: user.phone ? (user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone}`) : 'Not provided',
      }));
    }
  }, [user]);

  // Modals & Toast State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Toggle Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [promoEmails, setPromoEmails] = useState(true);

  // Form States
  const [profileForm, setProfileForm] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
  });

  useEffect(() => {
    setProfileForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
    });
  }, [userData]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      await profileService.updateBasicProfile({
        name: fullName,
        email: profileForm.email,
        phone: profileForm.phone,
      });

      // Refetch user context profile
      try {
        const freshUser = await authService.getMe();
        if (setUser) setUser(freshUser);
      } catch {
        // Fallback local update
      }

      setUserData(prev => ({
        ...prev,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone
      }));
      setIsEditProfileOpen(false);
      triggerToast('Profile information updated successfully!');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to update profile details.');
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Top Breadcrumb & Welcome Greeting Bar */}
        <div className={styles.topBarWrapper}>
          <div className={styles.topBreadcrumbGroup}>
            <Link href="/" className={styles.crumbLink}>Home</Link>
            <span className={styles.crumbSeparator}>›</span>
            <span className={styles.crumbActive}>My Account</span>
            <span className={styles.crumbSeparator}>›</span>
            <span className={styles.crumbActive}>Profile Details</span>
          </div>

          <div className={styles.welcomePill}>
            <span>Welcome back, <strong>{userData.firstName}!</strong> 🐾</span>
          </div>
        </div>

        {/* Layout Grid: Sidebar + Main Content */}
        <div className={styles.accountLayoutGrid}>
          {/* Left Navigation Sidebar */}
          <AccountSidebarNav 
            user={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              totalOrders: userData.totalOrders,
              points: userData.points,
              tier: userData.tier,
            }} 
          />

          {/* Right Content Body Panel */}
          <div className={styles.mainContentPanel}>
            
            {/* Header Title Section */}
            <div className={styles.panelHeaderBlock}>
              <div>
                <h1 className={styles.pageHeading}>Profile Details</h1>
                <p className={styles.pageSubheading}>
                  Manage your personal identity, contact preferences, and security settings.
                </p>
              </div>
              <div className={styles.vipBadgePill}>
                <Crown size={14} fill="#F99205" color="#F99205" />
                <span>{userData.tier}</span>
              </div>
            </div>

            <div className={styles.sectionsContainer}>
              
              {/* 1. PERSONAL INFORMATION BLOCK */}
              <div className={styles.sectionBlockCard}>
                <div className={styles.sectionBlockHeader}>
                  <div>
                    <h2 className={styles.blockTitle}>Personal Information</h2>
                    <p className={styles.blockSubtitle}>Keep your information up to date.</p>
                  </div>
                  <button 
                    type="button" 
                    className={styles.editSectionBtn}
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Edit3 size={15} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className={styles.infoFieldsGrid}>
                  {/* Full Name */}
                  <div className={styles.infoFieldItem}>
                    <div className={styles.infoFieldIconBox}>
                      <User size={18} />
                    </div>
                    <div className={styles.infoFieldTextGroup}>
                      <span className={styles.infoFieldLabel}>Full Name</span>
                      <span className={styles.infoFieldValue}>{userData.firstName} {userData.lastName}</span>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className={styles.infoFieldItem}>
                    <div className={styles.infoFieldIconBox}>
                      <Mail size={18} />
                    </div>
                    <div className={styles.infoFieldTextGroup}>
                      <span className={styles.infoFieldLabel}>Email Address</span>
                      <span className={styles.infoFieldValue}>{userData.email}</span>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className={styles.infoFieldItem}>
                    <div className={styles.infoFieldIconBox}>
                      <Phone size={18} />
                    </div>
                    <div className={styles.infoFieldTextGroup}>
                      <span className={styles.infoFieldLabel}>Phone Number</span>
                      <span className={styles.infoFieldValue}>{userData.phone}</span>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className={styles.infoFieldItem}>
                    <div className={styles.infoFieldIconBox}>
                      <Calendar size={18} />
                    </div>
                    <div className={styles.infoFieldTextGroup}>
                      <span className={styles.infoFieldLabel}>Member Since</span>
                      <span className={styles.infoFieldValue}>{userData.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ACCOUNT PREFERENCES BLOCK */}
              <div className={styles.sectionBlockCard}>
                <div className={styles.sectionBlockHeader}>
                  <div>
                    <h2 className={styles.blockTitle}>Account Preferences</h2>
                    <p className={styles.blockSubtitle}>Manage your communication and account settings.</p>
                  </div>
                </div>

                <div className={styles.preferencesList}>
                  {/* Row 1: Email Notifications */}
                  <div className={styles.preferenceRowItem}>
                    <div className={styles.prefIconBox}>
                      <Bell size={18} />
                    </div>
                    <div className={styles.prefTextGroup}>
                      <span className={styles.prefTitle}>Email Notifications</span>
                      <span className={styles.prefSubtitle}>Receive updates about your orders, offers and new products</span>
                    </div>
                    <button 
                      type="button"
                      className={`${styles.toggleSwitch} ${emailNotifs ? styles.toggleOn : ''}`}
                      onClick={() => setEmailNotifs(!emailNotifs)}
                    >
                      <div className={styles.toggleKnob} />
                    </button>
                  </div>

                  {/* Row 2: Promotional Emails */}
                  <div className={styles.preferenceRowItem}>
                    <div className={styles.prefIconBox}>
                      <Tag size={18} />
                    </div>
                    <div className={styles.prefTextGroup}>
                      <span className={styles.prefTitle}>Promotional Emails</span>
                      <span className={styles.prefSubtitle}>Get exclusive deals and pet care tips</span>
                    </div>
                    <button 
                      type="button"
                      className={`${styles.toggleSwitch} ${promoEmails ? styles.toggleOn : ''}`}
                      onClick={() => setPromoEmails(!promoEmails)}
                    >
                      <div className={styles.toggleKnob} />
                    </button>
                  </div>

                  {/* Row 3: Account Privacy */}
                  <div className={`${styles.preferenceRowItem} ${styles.clickablePrefRow}`}>
                    <div className={styles.prefIconBox}>
                      <ShieldCheck size={18} />
                    </div>
                    <div className={styles.prefTextGroup}>
                      <span className={styles.prefTitle}>Account Privacy</span>
                      <span className={styles.prefSubtitle}>Manage how your information is used</span>
                    </div>
                    <div className={styles.prefChevronBox}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Mobile Footer Need Help Card & Made with love line */}
            <div className={styles.mobileOnlyFooterGroup}>
              <div className={styles.mobileHelpBannerCard}>
                <div className={styles.helpLeftSection}>
                  <div className={styles.helpMascotCircle}>
                    <span className={styles.dogEmoji}>🐶</span>
                  </div>
                  <div className={styles.helpTextGroup}>
                    <span className={styles.helpTitle}>Need Help?</span>
                    <span className={styles.helpSubtitle}>We're here for you!</span>
                  </div>
                </div>
              </div>
              <div className={styles.madeWithLoveFooter}>
                <span>Made with ❤️ by <strong>KickAt</strong></span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsEditProfileOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <Edit3 size={20} color="#F99205" />
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
                <button type="button" className={styles.actionBtn} onClick={() => setIsEditProfileOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.actionBtn} ${styles.primaryBtn}`} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
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
