import { Truck, ShieldCheck, RefreshCw, Lock, Headset } from 'lucide-react';
import styles from './TrustStrip.module.css';

const features = [
  {
    icon: Truck,
    title: "Free & Fast Delivery",
    subtitle: "On orders over ₹999"
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    subtitle: "Trusted & Premium Quality"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    subtitle: "Hassle-free Returns"
  },
  {
    icon: Lock,
    title: "Secure Payments",
    subtitle: "Safe & Protected"
  },
  {
    icon: Headset,
    title: "24/7 Support",
    subtitle: "We're Here to Help"
  }
];

export function TrustStrip() {
  const trackContent = features.map((feature, idx) => {
    const Icon = feature.icon;
    return (
      <div key={idx} className={styles.featureWrapper}>
        <div className={styles.item}>
          <div className={styles.iconWrapper}>
            <Icon className={styles.icon} strokeWidth={1.5} />
          </div>
          <div className={styles.textContent}>
            <span className={styles.title}>{feature.title}</span>
            <span className={styles.subtitle}>{feature.subtitle}</span>
          </div>
        </div>
        {idx < features.length - 1 ? (
          <div className={styles.divider} />
        ) : (
          <div className={`${styles.divider} ${styles.mobileOnlyDivider}`} />
        )}
      </div>
    );
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.track}>
          {trackContent}
        </div>
        <div className={`${styles.track} ${styles.duplicateTrack}`} aria-hidden="true">
          {trackContent}
        </div>
      </div>
    </div>
  );
}
