import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from './Button';
import styles from './ui.module.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDanger?: boolean;
  confirmPattern?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false,
  confirmPattern = '',
  isLoading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => setMounted(true), []);
  if (!isOpen || !mounted) return null;
  
  const canConfirm = confirmPattern ? inputValue === confirmPattern : true;
  
  return createPortal(
    <div className={styles.dialogBackdrop} onClick={() => !isLoading && onCancel()}>
      <div className={styles.dialogCard} onClick={e => e.stopPropagation()}>
        <h3 className={styles.dialogTitle}>{title}</h3>
        <p className={styles.dialogMessage}>{message}</p>
        
        {confirmPattern && (
          <input 
            type="text" 
            className={styles.dialogInput}
            placeholder={`Type ${confirmPattern} to confirm`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
        )}
        
        <div className={styles.dialogActions}>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            style={{ minHeight: '44px', minWidth: '80px' }}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
            style={{ minHeight: '44px', minWidth: '100px' }}
          >
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
