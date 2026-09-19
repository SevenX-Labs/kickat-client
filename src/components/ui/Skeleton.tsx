import React from 'react';
import styles from './ui.module.css';

export function Skeleton({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return <div className={`${styles.skeleton} ${className || ''}`} style={style} />;
}
