"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, User, MapPin, CreditCard, Shield, Heart, Crown,
  ChevronRight, Bell
} from 'lucide-react';
import styles from './Account.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';

function AccountMainHubContent() {
  const { user, setUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [userData, setUserData] = useState({
    firstName: "KickAt",
    lastName: "Member",
    email: "member@kickat.co.in",
    phone: "Not provided",
    tier: "Gold Paw VIP",
    points: 1240,
  });

  // Query parameter redirect handler for legacy query params
  useEffect(() => {
    if (tab === 'orders') {
      router.replace('/account/orders');
    } else if (tab === 'addresses') {
      router.replace('/account/addresses');
    } else if (tab === 'payments' || tab === 'payment-methods') {
      router.replace('/account/payment-methods');
    } else if (tab === 'profile') {
      router.replace('/account/profile');
    } else if (tab === 'wishlist') {
      router.replace('/account/wishlist');
    } else if (tab === 'notifications') {
      router.replace('/account/notifications');
    } else if (tab === 'privacy' || tab === 'settings') {
      router.replace('/account/privacy');
    }
  }, [tab, router]);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
      return;
    }

    const fetchFullProfile = async () => {
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
        console.error("Failed to load profile details for account hub:", err);
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

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <div className={styles.accountLayout}>

          {/* Left Column: Sidebar Navigation List */}
          <AccountSidebarNav user={userData} />

          {/* Right Column: Desktop Dashboard Panel (Hidden on Mobile) */}
          <div className={styles.desktopDashboardPanel}>

            {/* Welcome Banner */}
            <div className={styles.dashboardWelcomeBanner}>
              <div className={styles.welcomeTextGroup}>
                <div className={styles.welcomeVipBadge}>
                  <Crown size={12} fill="#F99205" color="#F99205" />
                  <span>{userData.tier}</span>
                </div>
                <h1 className={styles.welcomeHeading}>Welcome back, {userData.firstName}!</h1>
                <p className={styles.welcomeSubheading}>
                  Manage your personal details, view orders, update delivery addresses, and configure preferences.
                </p>
              </div>
              <Link href="/account/profile" className={styles.manageProfileBtn}>
                <User size={16} />
                <span>Manage Profile</span>
              </Link>
            </div>

            {/* Shortcut Overview Cards */}
            <div className={styles.dashboardShortcutGrid}>

              {/* 1. Profile Details */}
              <Link href="/account/profile" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <User size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>PROFILE</h2>
                <p className={styles.shortcutDesc}>{userData.firstName} {userData.lastName}</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>View Profile</span>
                </div>
              </Link>

              {/* 2. My Orders */}
              <Link href="/account/orders" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <Package size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>ORDERS</h2>
                <p className={styles.shortcutDesc}>Track & manage recent order purchases.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>View Orders</span>
                </div>
              </Link>

              {/* 3. Saved Addresses */}
              <Link href="/account/addresses" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <MapPin size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>ADDRESSES</h2>
                <p className={styles.shortcutDesc}>Manage home & office delivery addresses.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Manage Addresses</span>
                </div>
              </Link>

              {/* 4. Payment Methods */}
              <Link href="/account/payment-methods" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <CreditCard size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>PAYMENTS</h2>
                <p className={styles.shortcutDesc}>Saved payment options & checkout preferences.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>View Payment Methods</span>
                </div>
              </Link>

              {/* 5. Wishlist */}
              <Link href="/account/wishlist" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <Heart size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>WISHLIST</h2>
                <p className={styles.shortcutDesc}>Your favorite saved pet supplies.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>View Wishlist</span>
                </div>
              </Link>

              {/* 6. Notifications */}
              <Link href="/account/notifications" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <Bell size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>NOTIFICATIONS</h2>
                <p className={styles.shortcutDesc}>Order updates & promotional alerts.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>View Notifications</span>
                </div>
              </Link>

              {/* 7. Privacy & Security */}
              <Link href="/account/privacy" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <Shield size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>PRIVACY & SECURITY</h2>
                <p className={styles.shortcutDesc}>Manage account security & data privacy.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Manage Privacy</span>
                </div>
              </Link>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading account menu...</div>}>
      <AccountMainHubContent />
    </Suspense>
  );
}
