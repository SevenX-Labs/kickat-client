"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Loader2 } from 'lucide-react';
import styles from './SignOutModal.module.css';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleConfirmClick = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return createPortal(
    <div className={styles.backdrop} onClick={() => !isSubmitting && onClose()}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <LogOut size={28} strokeWidth={2.2} />
        </div>

        <h3 className={styles.title}>Confirm Logout</h3>
        <p className={styles.subtitle}>
          Are you sure you want to log out of KickAt? You will need to sign in again to access your orders, wishlist, and saved addresses.
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
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
