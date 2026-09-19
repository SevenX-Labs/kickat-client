import React from 'react';
import styles from './ui.module.css';

export function Badge({ children, variant = 'info', className }: { children: React.ReactNode, variant?: string, className?: string }) {
  const vClass = styles[`badge_${variant}`] || styles.badge_info;
  return (
    <span className={`${styles.badge} ${vClass} ${className || ''}`}>
      {children}
    </span>
  );
}
