import { Heart, Stethoscope, Leaf } from 'lucide-react';
import styles from './WhyKickat.module.css';

const reasons = [
  {
    icon: Stethoscope,
    title: 'Vet Formulated',
    description: 'Every recipe is developed alongside leading veterinary nutritionists to ensure optimal health and longevity for your pet.'
  },
  {
    icon: Leaf,
    title: 'Premium Ingredients',
    description: 'We source only the finest, human-grade ingredients. No fillers, no artificial preservatives, just honest nutrition.'
  },
  {
    icon: Heart,
    title: 'The Unbreakable Bond',
    description: 'We believe in products that enhance the lifelong connection between you and your best friend.'
  }
];

export function WhyKickat() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why KickAt?</h2>
          <p className={styles.subtitle}>
            We refuse to compromise when it comes to the family members who mean the most.
          </p>
        </div>
        
        <div className={styles.grid}>
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div key={idx} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} strokeWidth={1.5} />
                </div>
                <h3 className={styles.cardTitle}>{reason.title}</h3>
                <p className={styles.cardDescription}>{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
