"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Smartphone, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { OtpSuccessModal } from "@/components/common/OtpSuccessModal/OtpSuccessModal";
import styles from "./Login.module.css";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sendMobileOtp, verifyMobileOtp, isAuthenticated, user } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Parse error query parameter if redirected back from Google OAuth
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(errorParam);
    }
  }, [searchParams]);

  // If already authenticated and success modal is not active, redirect
  useEffect(() => {
    if (isAuthenticated && !isSuccessModalOpen) {
      const redirectTo = searchParams.get("redirect") || "/account";
      router.push(redirectTo);
    }
  }, [isAuthenticated, isSuccessModalOpen, router, searchParams]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await sendMobileOtp(phoneNumber);
      setStep("otp");
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await sendMobileOtp(phoneNumber);
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await verifyMobileOtp(phoneNumber, otp);
      if (res.success) {
        setIsSuccessModalOpen(true);
        const redirectTo = searchParams.get("redirect") || "/account";
        
        // Show 2.5s animated success modal before navigating
        setTimeout(() => {
          router.push(redirectTo);
        }, 2500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid OTP code. Please check and try again.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = authService.getGoogleLoginUrl();
    window.location.href = googleLoginUrl;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Animated Success Dialog Box */}
      <OtpSuccessModal 
        isOpen={isSuccessModalOpen} 
        phone={phoneNumber} 
        userName={user?.name}
      />

      {/* Left Branding Section (Desktop only) */}
      <div className={styles.brandingSection}>
        <div className={styles.brandingPattern}></div>
        
        <div className={styles.brandingContent}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '3rem' }}>
            <Image 
              src="/logo-withoutbg.png" 
              alt="KickAt Logo" 
              width={180} 
              height={80} 
              style={{ objectFit: 'contain', width: 'auto', height: 'auto' }} 
              priority
            />
          </Link>
          <h1 className={styles.brandingTitle}>
            Premium Care for<br/>Your <span className={styles.highlight}>Best Friend.</span>
          </h1>
          <p className={styles.brandingSubtitle}>
            Join the KickAt family to unlock exclusive rewards, track your orders, and shop the finest pet essentials.
          </p>
        </div>

        <div className={styles.brandingQuote}>
          "Because they deserve nothing but the very best."
        </div>
      </div>

      {/* Right Form Section */}
      <div className={styles.formSection}>
        <div className={styles.loginCard}>
          {step === "otp" && (
            <button 
              className={styles.backBtn} 
              onClick={() => {
                setStep("phone");
                setErrorMessage(null);
                setOtp("");
              }}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>
              {step === "phone" 
                ? "Sign in to access your account, orders, and wishlist."
                : `Enter the 6-digit code sent to +91 ${phoneNumber}`
              }
            </p>
          </div>

          {errorMessage && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "phone" ? (
            <>
              <button className={styles.googleBtn} onClick={handleGoogleLogin} type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className={styles.divider}>
                <span className={styles.dividerText}>or continue with</span>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mobile Number</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>+91</span>
                    <input 
                      type="tel" 
                      className={styles.input}
                      placeholder="Enter your 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className={styles.primaryBtn}
                  disabled={phoneNumber.length < 10 || isSubmitting}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Loader2 size={18} className="animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className={styles.formGroup}>
                <label className={styles.label}>One Time Password (OTP)</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.prefix}><Smartphone size={18} /></span>
                  <input 
                    type="text" 
                    className={styles.input}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    disabled={isSubmitting}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className={styles.primaryBtn}
                disabled={otp.length < 6 || isSubmitting}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Login"
                )}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                Didn't receive code?{' '}
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  className={styles.resendBtn}
                  disabled={resendCooldown > 0 || isSubmitting}
                  style={{
                    opacity: resendCooldown > 0 ? 0.6 : 1,
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <div className={styles.footer}>
            By continuing, you agree to KickAt's <Link href="/terms" className={styles.link}>Terms</Link> and <Link href="/privacy" className={styles.link}>Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
