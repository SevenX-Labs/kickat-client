"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Package, MapPin, CreditCard, Heart, Settings, Crown, ChevronRight 
} from 'lucide-react';
import styles from './Account.module.css';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';

function AccountMainHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');
  const { user, setUser, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent('/account')}`);
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle URL redirects for legacy tab search params
  useEffect(() => {
    if (tab === 'profile') {
      router.replace('/account/profile');
    } else if (tab === 'orders') {
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

  // Fetch complete profile details from backend for sidebar card
  useEffect(() => {
    document.title = "My Account | KickAt";

    if (!isAuthenticated && !isLoading) return;

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

            {/* Shortcut Grid */}
            <div className={styles.dashboardShortcutGrid}>
              
              {/* 1. Profile Details */}
              <Link href="/account/profile" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <User size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>Profile Details</h2>
                <p className={styles.shortcutDesc}>Personal identity, contact information, phone status & verification details.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>{userData.email}</span>
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
                <h2 className={styles.shortcutTitle}>My Orders</h2>
                <p className={styles.shortcutDesc}>Track active shipments, view past order history & manage tax invoices.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Track & Manage Orders</span>
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
                <h2 className={styles.shortcutTitle}>Saved Addresses</h2>
                <p className={styles.shortcutDesc}>Delivery addresses for fast checkout, home/office tags & pincode details.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Delivery Locations</span>
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
                <h2 className={styles.shortcutTitle}>Payment Methods</h2>
                <p className={styles.shortcutDesc}>Saved credit/debit cards, UPI VPA handles & quick payment options.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Cards & UPI Options</span>
                </div>
              </Link>

              {/* 5. Wishlist */}
              <Link href="/wishlist" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <Heart size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>Wishlist</h2>
                <p className={styles.shortcutDesc}>Saved favorite products, pet supplies & saved items for later purchase.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Saved Pet Items</span>
                </div>
              </Link>

              {/* 6. Settings & Privacy */}
              <Link href="/account/settings" className={styles.shortcutCard}>
                <div className={styles.shortcutCardHeader}>
                  <div className={styles.shortcutIconWrap}>
                    <Settings size={22} color="#F99205" />
                  </div>
                  <ChevronRight size={18} className={styles.shortcutChevron} />
                </div>
                <h2 className={styles.shortcutTitle}>Settings & Privacy</h2>
                <p className={styles.shortcutDesc}>Notification settings, promotional updates & account privacy preferences.</p>
                <div className={styles.shortcutMetaBadge}>
                  <span>Account Preferences</span>
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
