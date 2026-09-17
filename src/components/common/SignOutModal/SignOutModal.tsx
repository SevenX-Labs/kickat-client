"use client";

import React, { useEffect, useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import styles from './SignOutModal.module.css';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Sign Out Failed:', err);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={() => !isSubmitting && onClose()}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <LogOut size={28} strokeWidth={2.2} />
        </div>

        <h3 className={styles.title}>Sign Out of KickAt?</h3>
        <p className={styles.subtitle}>
          Are you sure you want to sign out? You will need to sign in again to access your orders, wishlist, and rewards.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.signOutBtn}
            onClick={handleConfirmClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
