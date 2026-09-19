"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { OtpSuccessModal } from '@/components/common/OtpSuccessModal/OtpSuccessModal';
import styles from './GoogleCallback.module.css';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const isNewUserStr = searchParams.get('isNewUser');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setErrorMessage(errorParam);
        setTimeout(() => {
          router.replace('/login?error=' + encodeURIComponent(errorParam));
        }, 2000);
        return;
      }

      if (!token) {
        const msg = 'No authentication token provided';
        setStatus('error');
        setErrorMessage(msg);
        setTimeout(() => {
          router.replace('/login?error=' + encodeURIComponent(msg));
        }, 2000);
        return;
      }

      try {
        const user = await loginWithToken(token);
        setAuthUser(user);
        setStatus('success');

        const isProfileComplete = Boolean(
          user?.isProfileComplete ||
          user?.profileCompleted ||
          (user?.name && user.name.trim().length > 0 && (user?.email || user?.phone))
        );

        const targetRedirect = searchParams.get('redirect') || '/account';

        setTimeout(() => {
          if (!isProfileComplete && isNewUserStr === 'true') {
            router.replace('/onboarding');
          } else {
            router.replace(targetRedirect);
          }
        }, 2000);
      } catch (err: any) {
        const msg = err?.message || 'Failed to complete Google authentication';
        setStatus('error');
        setErrorMessage(msg);
        setTimeout(() => {
          router.replace('/login?error=' + encodeURIComponent(msg));
        }, 2500);
      }
    };

    handleAuth();
  }, [searchParams, loginWithToken, router]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />

      <OtpSuccessModal
        isOpen={status === 'success'}
        userName={authUser?.name}
        title="Login Successful!"
      />

      <div className={styles.glassCard}>
        <Link href="/" className={styles.logoWrapper}>
          <Image
            src="/logo-clean.png"
            alt="KickAt Logo"
            width={150}
            height={55}
            className={styles.logoImage}
            priority
          />
        </Link>

        {status === 'loading' && (
          <div>
            <div className={`${styles.iconBadge} ${styles.loadingBadge}`}>
              <Loader2 size={32} className={styles.spinner} />
            </div>
            <h2 className={styles.title}>
              Authenticating with Google...
            </h2>
            <p className={styles.subtitle}>
              Connecting your account securely. Please wait a moment.
            </p>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className={`${styles.iconBadge} ${styles.successBadge}`}>
              <CheckCircle2 size={36} />
            </div>
            <h2 className={styles.title}>
              Google Sign-In Successful!
            </h2>
            <p className={styles.subtitle}>
              Redirecting you to KickAt...
            </p>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFillSuccess} />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className={`${styles.iconBadge} ${styles.errorBadge}`}>
              <AlertCircle size={36} />
            </div>
            <h2 className={styles.title}>
              Authentication Failed
            </h2>
            <p className={styles.subtitle} style={{ color: '#DC2626' }}>
              {errorMessage || 'Something went wrong.'}
            </p>
            <Link href="/login" className={styles.errorActionBtn}>
              <span>Return to Login</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        <div className={styles.securityBadge}>
          <ShieldCheck size={14} style={{ color: '#F59E0B' }} />
          <span>256-bit SSL Secure Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageWrapper}>
          <div className={styles.glassCard}>
            <div className={`${styles.iconBadge} ${styles.loadingBadge}`}>
              <Loader2 size={32} className={styles.spinner} />
            </div>
            <h2 className={styles.title}>Loading...</h2>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
