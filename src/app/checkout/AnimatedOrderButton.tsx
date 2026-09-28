"use client";

import { useState } from 'react';
import { Loader2, Lock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './AnimatedOrderButton.module.css';

interface Props {
  onValidate?: () => boolean;
  onTriggerOrder?: () => Promise<boolean>;
  onComplete?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  loadingText?: string;
}

export function AnimatedOrderButton({
  onValidate,
  onTriggerOrder,
  onComplete,
  isSubmitting = false,
  disabled = false,
  className = '',
  label = 'Proceed to Pay Securely',
  loadingText = 'Processing Order...',
}: Props) {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (disabled || isSubmitting || isSuccess) {
      return;
    }

    if (onValidate && !onValidate()) {
      return;
    }

    if (onTriggerOrder) {
      try {
        const success = await onTriggerOrder();
        if (success) {
          setIsSuccess(true);
          if (onComplete) {
            setTimeout(() => {
              onComplete();
            }, 600);
          }
        }
      } catch (err) {
        console.error('[OrderButton] Order trigger error:', err);
      }
    }
  };

  const isCOD = label.toLowerCase().includes('cash on delivery') || label.toLowerCase().includes('cod');

  return (
    <button
      className={`${styles.orderButton} ${isSuccess ? styles.orderSuccess : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || isSubmitting || isSuccess}
      type="button"
    >
      <div className={styles.buttonInner}>
        {isSubmitting ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 0.8s linear infinite' }} />
            <span>{loadingText}</span>
          </div>
        ) : isSuccess ? (
          <div className={styles.successContainer}>
            <CheckCircle2 size={22} strokeWidth={2.5} />
            <span>Order Placed Successfully!</span>
          </div>
        ) : (
          <div className={styles.labelContainer}>
            <div className={styles.iconCircle}>
              {isCOD ? <ShieldCheck size={18} /> : <Lock size={16} />}
            </div>
            <span className={styles.labelText}>{label}</span>
            <ArrowRight size={18} className={styles.arrowIcon} />
          </div>
        )}
      </div>
      <div className={styles.buttonShimmer} />
    </button>
  );
}
