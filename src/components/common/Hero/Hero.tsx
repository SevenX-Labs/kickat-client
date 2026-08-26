"use client";

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { BottleModel } from './BottleModel';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      {/* Decorative Glassmorphism Background */}
      <div className={styles.glassCircle} />
      
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

        {/* Right Column: Interactive 3D Model */}
        <div className={styles.visualContent} style={{ cursor: 'grab', height: '100%', minHeight: '500px' }}>
          <Canvas 
            camera={{ position: [-1.5, 0, 8], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ alpha: true, antialias: true }}
          >
            <BottleModel />
          </Canvas>
        </div>

      </div>
    </section>
  );
}
