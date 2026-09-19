import React from 'react';
import styles from './ui.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', icon, className, ...props }, ref) => {
    return (
      <button 
        ref={ref}
        className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className || ''}`}
        {...props}
      >
        {icon && <span className={styles.btnIcon}>{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
