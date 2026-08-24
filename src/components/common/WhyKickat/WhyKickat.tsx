import { Stethoscope, Leaf, Heart, Truck, Shield, Award } from 'lucide-react';
import styles from './WhyKickat.module.css';

const heroStats = [
  {
    icon: Heart,
    value: '25K+',
    label: 'HAPPY PETS',
    description: 'Trusted by pet parents across the country.',
  },
  {
    icon: Stethoscope,
    value: '50+',
    label: 'VET PARTNERS',
    description: 'Formulated with leading nutritionists.',
  },
  {
    icon: Leaf,
    value: '100%',
    label: 'NATURAL',
    description: 'Human-grade, no fillers, no preservatives.',
  },
];

const secondaryStats = [
  { icon: Truck, value: '2–3 Day', label: 'FREE DELIVERY' },
  { icon: Shield, value: '200+', label: 'TRUSTED BRANDS' },
  { icon: Award, value: '30 Day', label: 'EASY RETURNS' },
];

export function WhyKickat() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Left-aligned header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Why choose us</span>
          <h2 className={styles.title}>Why KickAt?</h2>
        </div>

        {/* Hero stats row — large editorial numbers */}
        <div className={styles.heroRow}>
          {heroStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={styles.heroCard}>
                <Icon className={styles.heroIcon} strokeWidth={1.25} />
                <div className={styles.heroValue}>{stat.value}</div>
                <div className={styles.heroLabel}>{stat.label}</div>
                <p className={styles.heroDesc}>{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Secondary stats — slim inline strip */}
        <div className={styles.secondaryRow}>
          {secondaryStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={styles.secondaryItem}>
                <Icon className={styles.secondaryIcon} strokeWidth={1.25} />
                <div className={styles.secondaryText}>
                  <span className={styles.secondaryValue}>{stat.value}</span>
                  <span className={styles.secondaryLabel}>{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
