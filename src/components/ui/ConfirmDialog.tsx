import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import styles from './ui.module.css';

export function ConfirmDialog({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = false, confirmPattern = '' }: any) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => setMounted(true), []);
  if (!isOpen || !mounted) return null;
  
  const canConfirm = confirmPattern ? inputValue === confirmPattern : true;
  
  return createPortal(
    <div className={styles.dialogBackdrop} onClick={onCancel}>
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
          />
        )}
        
        <div className={styles.dialogActions}>
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} disabled={!canConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
