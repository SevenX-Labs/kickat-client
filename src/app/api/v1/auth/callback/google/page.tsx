"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { OtpSuccessModal } from "@/components/common/OtpSuccessModal/OtpSuccessModal";
import styles from "@/app/auth/callback/google/GoogleCallback.module.css";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken, setUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const processCallback = async () => {
      const errorParam = searchParams.get("error");
      const codeParam = searchParams.get("code");
      const tokenParam = searchParams.get("token");
      const isNewUser = searchParams.get("isNewUser") === "true";
      const customRedirect = searchParams.get("redirect");

      if (errorParam) {
        setStatus('error');
        setErrorMessage(errorParam);
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(errorParam)}`);
        }, 2000);
        return;
      }

      if (tokenParam) {
        try {
          const user = await loginWithToken(tokenParam);
          setLoggedInUser(user);
          setStatus('success');
          const isProfileComplete = Boolean(user?.isProfileComplete || user?.profileCompleted || (user?.name && (user?.email || user?.phone)));
          const redirectTarget = (!isProfileComplete && isNewUser) ? "/onboarding" : (customRedirect || "/account");
          setTimeout(() => {
            router.push(redirectTarget);
          }, 2000);
          return;
        } catch (err: any) {
          const msg = err?.message || "Failed to establish user session.";
          setStatus('error');
          setErrorMessage(msg);
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(msg)}`);
          }, 2500);
          return;
        }
      }

      if (codeParam) {
        try {
          const redirectUri = window.location.origin + "/api/v1/auth/callback/google";
          const res = await authService.googleAuth(codeParam, redirectUri);
          
          if (res.accessToken) {
            setUser(res.user);
            setLoggedInUser(res.user);
            setStatus('success');
            
            const isProfileComplete = Boolean(res.user?.isProfileComplete || res.user?.profileCompleted || (res.user?.name && (res.user?.email || res.user?.phone)));
            const redirectTarget = (!isProfileComplete && res.isNewUser) ? "/onboarding" : (customRedirect || "/account");
            setTimeout(() => {
              router.push(redirectTarget);
            }, 2000);
          } else {
            throw new Error("Missing access token from server response");
          }
        } catch (err: any) {
          console.error("Google Auth Exchange Error:", err);
          const msg = err?.message || "Failed to complete Google authentication";
          setStatus('error');
          setErrorMessage(msg);
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(msg)}`);
          }, 2500);
        }
        return;
      }

      const msg = "Authentication code or token missing";
      setStatus('error');
      setErrorMessage(msg);
      setTimeout(() => {
        router.push(`/login?error=${encodeURIComponent(msg)}`);
      }, 2500);
    };

    processCallback();
  }, [searchParams, loginWithToken, setUser, router]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />

      <OtpSuccessModal
        isOpen={status === 'success'}
        userName={loggedInUser?.name}
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
              Signing you in...
            </h2>
            <p className={styles.subtitle}>
              Completing Google OAuth authentication. Please wait.
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
              Login Successful!
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
              {errorMessage || "Something went wrong."}
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

export default function GoogleCallbackApiPage() {
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
