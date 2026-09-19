"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Phone, Calendar, ShieldCheck, 
  Edit3, Sparkles, Crown, ChevronRight, X, Loader2, ArrowLeft, CheckCircle2
} from 'lucide-react';
import styles from '../Account.module.css';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';

function ProfileDetailsContent() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent('/account/profile')}`);
    }
  }, [isLoading, isAuthenticated, router]);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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

  // Fetch complete profile details from backend on mount
  useEffect(() => {
    document.title = "Profile Details | KickAt";

    if (!isAuthenticated && !isLoading) return;

    const fetchFullProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res: any = await profileService.getProfile();
        const profileUser = res?.profile?.user || res?.user || res?.data || res;
        
        if (profileUser) {
          setUser(profileUser);
          const nameParts = (profileUser.name || '').trim().split(' ');
          const firstName = nameParts[0] || (profileUser.email ? profileUser.email.split('@')[0] : (profileUser.phone ? `User_${profileUser.phone.slice(-4)}` : 'KickAt'));
          const lastName = nameParts.slice(1).join(' ') || 'Member';

          setUserData(prev => ({
            ...prev,
            firstName,
            lastName,
            email: profileUser.email || 'Not provided',
            phone: profileUser.phone ? (profileUser.phone.startsWith('+91') ? profileUser.phone : `+91 ${profileUser.phone}`) : 'Not provided',
          }));
        }
      } catch (err: any) {
        console.error("Failed to load profile details:", err);
        if (err?.message?.includes('Unauthorized') || err?.message?.includes('401')) {
          router.replace(`/login?redirect=${encodeURIComponent('/account/profile')}`);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchFullProfile();
  }, [isAuthenticated, isLoading, router, setUser]);

  // Sync user state from AuthContext when available
  useEffect(() => {
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
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const openEditModal = () => {
    setProfileForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email === 'Not provided' ? '' : userData.email,
      phone: userData.phone === 'Not provided' ? '' : userData.phone.replace('+91 ', '')
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const fullName = `${profileForm.firstName.trim()} ${profileForm.lastName.trim()}`.trim();
      const updatedUserRes: any = await profileService.updateBasicProfile({
        name: fullName,
        email: profileForm.email.trim(),
        
      });

      const updatedUser = updatedUserRes?.profile?.user || updatedUserRes?.user || updatedUserRes?.data || updatedUserRes;
      
      if (updatedUser) {
        setUser(updatedUser);
      }

      setUserData(prev => ({
        ...prev,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim() || 'Not provided',
        phone: profileForm.phone.trim() ? (profileForm.phone.trim().startsWith('+91') ? profileForm.phone.trim() : `+91 ${profileForm.phone.trim()}`) : 'Not provided'
      }));

      setIsEditProfileOpen(false);
      setToastMsg('Profile details updated successfully!');
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      

      <main className={styles.container}>
        <div className={styles.accountLayout}>
          
          {/* Account Navigation Sidebar (Visible on Desktop, hidden on Mobile) */}
          <div className={styles.subpageSidebarWrapper}>
            <AccountSidebarNav user={userData} />
          </div>

          {/* Profile Details Content */}
          <div className={styles.contentArea}>
            <div className={styles.mainContentPanel}>
              
              {/* Back to Account Link */}
              <div className={styles.backHeaderGroup}>
                <Link href="/account" className={styles.backToAccountBtn}>
                  <ArrowLeft size={18} />
                  <span>Back to Account</span>
                </Link>
              </div>

              {/* Personal Information Card */}
              <div className={styles.sectionBlockCard}>
                <div className={styles.sectionBlockHeader}>
                  <div>
                    <h1 className={styles.blockTitle}>Profile Details</h1>
                    <p className={styles.blockSubtitle}>Manage your personal identity, contact preferences, and security settings.</p>
                  </div>
                  <button 
                    type="button" 
                    className={styles.editHeaderBtn}
                    onClick={openEditModal}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {isLoadingProfile ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#78746D' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <p>Loading details...</p>
                  </div>
                ) : (
                  <div className={styles.infoFieldsGrid}>
                    <div className={styles.infoFieldBox}>
                      <div className={styles.fieldIconWrap}>
                        <User size={18} />
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldLabel}>Full Name</span>
                        <span className={styles.fieldValue}>{userData.firstName} {userData.lastName}</span>
                      </div>
                    </div>

                    <div className={styles.infoFieldBox}>
                      <div className={styles.fieldIconWrap}>
                        <Mail size={18} />
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldLabel}>Email Address</span>
                        <span className={styles.fieldValue}>{userData.email}</span>
                      </div>
                    </div>

                    <div className={styles.infoFieldBox}>
                      <div className={styles.fieldIconWrap}>
                        <Phone size={18} />
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldLabel}>Phone Number</span>
                        <span className={styles.fieldValue}>{userData.phone}</span>
                      </div>
                    </div>

                    <div className={styles.infoFieldBox}>
                      <div className={styles.fieldIconWrap}>
                        <Calendar size={18} />
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldLabel}>Member Since</span>
                        <span className={styles.fieldValue}>{userData.memberSince}</span>
                      </div>
                    </div>

                    <div className={styles.infoFieldBox}>
                      <div className={styles.fieldIconWrap}>
                        <Crown size={18} />
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldLabel}>Membership Tier</span>
                        <span className={styles.fieldValue}>{userData.tier}</span>
                      </div>
                    </div>

                    <div className={styles.infoFieldBox}>
                      <div className={styles.fieldIconWrap}>
                        <ShieldCheck size={18} />
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldLabel}>Account Status</span>
                        <span className={styles.fieldValue} style={{ color: '#16A34A', fontWeight: 700 }}>Verified</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className={styles.modalBackdrop} onClick={() => !isSaving && setIsEditProfileOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <Edit3 size={20} color="#F99205" />
                <h2>Edit Personal Details</h2>
              </div>
              <button 
                type="button" 
                className={styles.modalCloseBtn} 
                onClick={() => setIsEditProfileOpen(false)}
                disabled={isSaving}
              >
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button 
                  type="button" 
                  className={styles.actionBtn} 
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading profile details...</div>}>
      <ProfileDetailsContent />
    </Suspense>
  );
}
