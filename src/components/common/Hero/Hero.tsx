import Link from 'next/link';
import { Star } from 'lucide-react';
import { ProductShowcase } from './ProductShowcase';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        
        {/* Left Column: Typography & CTAs */}
        <div className={styles.textContent}>

          <h1 className={styles.title}>
            A bond that <br />
            <span className={styles.highlight}>never ends.</span>
          </h1>
          <p className={styles.description}>
            Thoughtfully chosen food, treats, toys and everyday essentials for every moment you share.
          </p>
          
          <div className={styles.actions}>
            <Link href="/shop/dogs" className={styles.primaryBtn}>
              Shop Dog
            </Link>
            <Link href="/shop/cats" className={styles.secondaryBtn}>
              Shop Cat
            </Link>
          </div>
          
          <div className={styles.trustBar}>
            <div className={styles.trustItem}>
              <Star size={14} fill="#E7A03B" color="#E7A03B" strokeWidth={1} />
              <span>4.9 rated</span>
            </div>
            <span className={styles.trustDot}>&bull;</span>
            <div className={styles.trustItem}>
              <span>25K+ happy pets</span>
            </div>
            <span className={styles.trustDot}>&bull;</span>
            <div className={styles.trustItem}>
              <span>Free shipping over ₹999</span>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Product Showcase */}
        <div className={styles.visualContent}>
          <ProductShowcase />
        </div>

      </div>
    </section>
  );
}
