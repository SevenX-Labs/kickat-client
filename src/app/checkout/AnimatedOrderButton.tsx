'use client';
import { useState } from 'react';
import styles from './AnimatedOrderButton.module.css';
import { Loader2 } from 'lucide-react';

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
  label = 'Complete Order',
  loadingText = 'Processing Order...',
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (disabled || isSubmitting || isAnimating) {
      return;
    }

    if (onValidate && !onValidate()) {
      return;
    }

    if (onTriggerOrder) {
      try {
        const success = await onTriggerOrder();
        if (!success) {
          return;
        }
      } catch {
        return;
      }
    }

    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3400);

      setTimeout(() => {
        setIsAnimating(false);
      }, 4500);
    }
  };

  return (
    <button
      className={`${styles.order} ${isAnimating ? styles.animate : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || isSubmitting || isAnimating}
      type="button"
      style={disabled && !isSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
    >
      <span className={styles.default}>
        {isSubmitting ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span>{loadingText}</span>
          </span>
        ) : (
          label
        )}
      </span>
      <span className={styles.success}>
        Order Placed
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </svg>
      </span>
      <div className={styles.box}></div>
      <div className={styles.truck}>
        <div className={styles.back}></div>
        <div className={styles.front}>
          <div className={styles.window}></div>
        </div>
        <div className={`${styles.light} ${styles.top}`}></div>
        <div className={`${styles.light} ${styles.bottom}`}></div>
      </div>
      <div className={styles.lines}></div>
    </button>
  );
}
