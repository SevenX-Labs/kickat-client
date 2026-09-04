"use client";

import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';
import styles from './ProductDetail.module.css';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Pet Safe',
    subtitle: 'Non-toxic materials',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    subtitle: 'On orders above ₹999',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    subtitle: '7-day hassle free',
  },
  {
    icon: Lock,
    title: 'Secure Payment',
    subtitle: '100% protected',
  },
];

export function ProductTrustStrip() {
  return (
    <div className={styles.trustStripWrapper}>
      <div className={styles.trustStripGrid}>
        {TRUST_ITEMS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className={styles.trustItemCard}>
              <div className={styles.trustIconWrap}>
                <IconComponent size={22} className={styles.trustIcon} />
              </div>
              <div className={styles.trustTextWrap}>
                <h4 className={styles.trustTitle}>{item.title}</h4>
                <p className={styles.trustSubtitle}>{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
