import Link from 'next/link';
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
          
          <div className={styles.trustStatement}>
            Carefully curated &bull; Quality-first &bull; Made for happier pets
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
