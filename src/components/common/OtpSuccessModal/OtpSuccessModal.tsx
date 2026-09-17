"use client";

import React from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import styles from "./OtpSuccessModal.module.css";

export interface OtpSuccessModalProps {
  isOpen: boolean;
  phone?: string;
  userName?: string | null;
  title?: string;
  subtitle?: string;
}

export function OtpSuccessModal({
  isOpen,
  phone,
  userName,
  title = "OTP Verified Successfully!",
  subtitle,
}: OtpSuccessModalProps) {
  if (!isOpen) return null;

  const displayName = userName || (phone ? `+91 ${phone.slice(-10)}` : "Member");

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <div className={styles.topGlowBar}></div>

        <div className={styles.iconOuterRing}>
          <div className={styles.pulseHalo}></div>
          <div className={styles.iconCircle}>
            <svg className={styles.checkmarkSvg} viewBox="0 0 52 52">
              <path
                className={styles.checkmarkPath}
                d="M14 27 l10 10 l20 -20"
              />
            </svg>
          </div>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.subtitle}>
          {subtitle || (
            <>
              Welcome back to KickAt, <strong>{displayName}</strong>! Authentication complete.
            </>
          )}
        </p>

        <div className={styles.badge}>
          <ShieldCheck size={16} />
          <span>Secure Session Established</span>
        </div>

        <div className={styles.spinnerRow}>
          <Loader2 size={16} className="animate-spin" />
          <span>Redirecting to your account...</span>
        </div>
      </div>
    </div>
  );
}
