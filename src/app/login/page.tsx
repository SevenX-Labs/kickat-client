"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";
import styles from "./Login.module.css";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setStep("otp");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login success, in real app would verify OTP
    if (otp.length === 6) {
      localStorage.setItem("isLoggedIn", "true");
      const redirectTo = searchParams.get("redirect");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push("/account");
      }
    }
  };

  const handleGoogleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.push("/account");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
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
              style={{ objectFit: 'contain' }} 
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
            <button className={styles.backBtn} onClick={() => setStep("phone")}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          
          <div className={styles.header}>
            <div className={styles.logo} style={{ display: 'none' /* hidden on desktop if left has it, maybe show on mobile */ }}>
              <Link href="/">
                <Image 
                  src="/logo-clean.png" 
                  alt="KickAt Logo" 
                  width={140} 
                  height={60} 
                  style={{ objectFit: 'contain' }}
                />
              </Link>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>
              {step === "phone" 
                ? "Sign in to access your account, orders, and wishlist."
                : `Enter the 6-digit code sent to +91 ${phoneNumber}`
              }
            </p>
          </div>

        {step === "phone" ? (
          <>
            <button className={styles.googleBtn} onClick={handleGoogleLogin}>
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
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className={styles.primaryBtn}
                disabled={phoneNumber.length < 10}
              >
                Send OTP
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
                  required
                  autoFocus
                />
              </div>
            </div>
            <button 
              type="submit" 
              className={styles.primaryBtn}
              disabled={otp.length < 6}
            >
              Verify & Login
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                Didn't receive code? <button type="button" onClick={() => alert('OTP Resent!')} className={styles.resendBtn}>Resend OTP</button>
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
