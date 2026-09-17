"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { OtpSuccessModal } from '@/components/common/OtpSuccessModal/OtpSuccessModal';

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
        }, 1500);
        return;
      }

      if (!token) {
        const msg = 'No authentication token provided';
        setStatus('error');
        setErrorMessage(msg);
        setTimeout(() => {
          router.replace('/login?error=' + encodeURIComponent(msg));
        }, 1500);
        return;
      }

      try {
        const user = await loginWithToken(token);
        setAuthUser(user);
        setStatus('success');

        const isNewUser = isNewUserStr === 'true';
        const isProfileIncomplete = !user?.name || (!user?.phone && !user?.isPhoneVerified);

        const targetRedirect = searchParams.get('redirect') || '/';

        setTimeout(() => {
          if (isNewUser || isProfileIncomplete) {
            router.replace('/onboarding');
          } else {
            router.replace(targetRedirect);
          }
        }, 2500);
      } catch (err: any) {
        const msg = err?.message || 'Failed to complete Google authentication';
        setStatus('error');
        setErrorMessage(msg);
        setTimeout(() => {
          router.replace('/login?error=' + encodeURIComponent(msg));
        }, 2000);
      }
    };

    handleAuth();
  }, [searchParams, loginWithToken, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        padding: '2rem',
      }}
    >
      <OtpSuccessModal
        isOpen={status === 'success'}
        userName={authUser?.name}
        title="Login Successful!"
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
        }}
      >
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <Image
            src="/logo-withoutbg.png"
            alt="KickAt Logo"
            width={160}
            height={60}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {status === 'loading' && (
          <div>
            <Loader2
              size={40}
              style={{
                color: '#38BDF8',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.25rem auto',
              }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#F1F5F9' }}>
              Authenticating with Google...
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>
              Connecting your account securely. Please wait a moment.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle2
              size={44}
              style={{
                color: '#22C55E',
                margin: '0 auto 1.25rem auto',
              }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#F1F5F9' }}>
              Google Sign-In Successful!
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>
              Redirecting you to KickAt...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle
              size={44}
              style={{
                color: '#EF4444',
                margin: '0 auto 1.25rem auto',
              }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#F1F5F9' }}>
              Authentication Error
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#FCA5A5', margin: 0 }}>
              {errorMessage || 'Something went wrong.'}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
          }}
        >
          <Loader2 size={40} style={{ color: '#38BDF8', animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
