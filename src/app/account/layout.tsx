"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountSidebarNav from '@/components/account/AccountSidebarNav';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';
import styles from './Account.module.css';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace(`/login?redirect=${encodeURIComponent('/account')}`);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
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
        console.error("Failed to load profile details:", err);
        if (err?.message?.includes('Unauthorized') || err?.message?.includes('401')) {
          router.replace(`/login?redirect=${encodeURIComponent('/account')}`);
        }
      }
    };

    fetchFullProfile();
  }, [isAuthenticated, isLoading, router, setUser]);

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

  if (isLoading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        <div className={styles.accountLayout}>
          <AccountSidebarNav user={userData} />
          <div className={styles.mainContentPanel}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
