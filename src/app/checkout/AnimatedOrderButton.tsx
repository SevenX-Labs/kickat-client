'use client';
import { useState } from 'react';
import styles from './AnimatedOrderButton.module.css';

interface Props {
  onValidate?: () => boolean;
  onComplete?: () => void;
  className?: string;
}

export function AnimatedOrderButton({ onValidate, onComplete, className = '' }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onValidate && !onValidate()) {
      return; // Do nothing if validation fails (let browser show HTML5 tooltips if it's a submit button)
    }

    e.preventDefault(); // Prevent form submission so we can animate and manually route

    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 8500); // Fire after success text fully appears (starts at 7s)
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 10000);
    }
  };

  return (
    <button 
      className={`${styles.order} ${isAnimating ? styles.animate : ''} ${className}`} 
      onClick={handleClick}
      type="submit"
    >
      <span className={styles.default}>Complete Order</span>
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
