"use client";

import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { usePublicSettings } from '@/hooks/usePublicSettings';

export function ProductTrustStrip() {
  const { delivery } = usePublicSettings();
  
  const isFreeDeliveryAll = delivery ? (!delivery.deliveryFeeEnabled || delivery.freeDeliveryThreshold === 0) : false;
  const deliverySubtitle = !delivery
    ? "Fast shipping available"
    : isFreeDeliveryAll
    ? "Free on all orders"
    : `On orders above ₹${delivery.freeDeliveryThreshold}`;

  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Pet Safe',
      subtitle: 'Non-toxic materials',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: deliverySubtitle,
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

  return (
    <div className={styles.trustStripWrapper}>
      <div className={styles.trustStripGrid}>
        {trustItems.map((item, idx) => {
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
