"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
      <main className={styles.container} style={{ maxWidth: '640px' }}>
        <AccountSidebarNav user={userData} />
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
