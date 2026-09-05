"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Bone, PawPrint, Fish, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './Hero.module.css';

// Dynamic import of Three.js Canvas to prevent main-thread hydration delay
const DynamicBottleCanvas = dynamic(() => import('./BottleModelCanvas').then(mod => mod.BottleModelCanvas), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%' }} />
});

export function Hero() {
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    // Load 3D model canvas in background while splash loader is displaying
    const timer = setTimeout(() => setShow3D(true), 400);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section className={styles.hero}>
      {/* Wavy Fluid Background Animations */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Premium Floating Pet Icons */}
      <div className={styles.floatingIcons}>
        <div className={`${styles.floatIcon} ${styles.icon1}`}><PawPrint size={40} strokeWidth={1.5} /></div>
        <div className={`${styles.floatIcon} ${styles.icon2}`}><Bone size={36} strokeWidth={1.5} /></div>
        <div className={`${styles.floatIcon} ${styles.icon3}`}><Fish size={44} strokeWidth={1.5} /></div>
        <div className={`${styles.floatIcon} ${styles.icon4}`}><PawPrint size={32} strokeWidth={1.5} /></div>
        <div className={`${styles.floatIcon} ${styles.icon5}`}><Bone size={40} strokeWidth={1.5} /></div>
        <div className={`${styles.floatIcon} ${styles.icon6}`}><Fish size={32} strokeWidth={1.5} /></div>
      </div>

      {/* Decorative Glassmorphism Background */}
      <div className={styles.glassCircle} />
      
      <div className={styles.container}>
        
        {/* Left Column: Typography & CTAs */}
        <div className={styles.textContent}>
          <div className={styles.badge}>
            <div className={styles.badgeAvatars} aria-hidden="true">
              <span>🐾</span>
              <span>🐶</span>
              <span>🐱</span>
            </div>
            <span className={styles.badgeText}>Trusted by 25K+ pet parents</span>
            <span className={styles.badgeHeart}>♡</span>
          </div>

          <h1 className={styles.title}>
            A bond that <br />
            <span className={styles.highlight}>never ends.</span>
          </h1>
          <p className={styles.description}>
            Thoughtfully chosen food, treats, toys and everyday essentials for every moment you share.
          </p>
          
          <div className={styles.actions}>
            <Link href="/category" className={styles.primaryBtn}>
              <span className={styles.btnText}>Shop Now</span>
              <ArrowRight className={styles.btnIcon} size={18} />
            </Link>
            <Link href="/category" className={styles.secondaryBtn}>
              <span className={styles.btnText}>Explore Categories</span>
              <ArrowRight className={styles.btnIcon} size={18} />
            </Link>
          </div>
          
          <div className={styles.trustBar}>
            <div className={styles.trustItem}>
              <div className={styles.avatarStack} aria-hidden="true">
                <span>🐶</span>
                <span>🐱</span>
                <span>🐰</span>
              </div>
              <div className={styles.ratingGroup}>
                <div className={styles.stars} aria-hidden="true">
                  <Star size={14} fill="#FD802E" color="#FD802E" strokeWidth={1} />
                  <Star size={14} fill="#FD802E" color="#FD802E" strokeWidth={1} />
                  <Star size={14} fill="#FD802E" color="#FD802E" strokeWidth={1} />
                  <Star size={14} fill="#FD802E" color="#FD802E" strokeWidth={1} />
                  <Star size={14} fill="#FD802E" color="#FD802E" strokeWidth={1} opacity={0.45} />
                </div>
                <span>4.9/5 from 25K+ happy pet parents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Model */}
        <div className={styles.visualContent} style={{ cursor: 'grab' }}>
          {show3D && <DynamicBottleCanvas />}
        </div>

      </div>

      {/* Animated Bottom Wave */}
      <div className={styles.waveContainer}>
        <svg className={styles.waves} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className={styles.parallax}>
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255, 255, 255, 0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255, 255, 255, 0.5)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255, 255, 255, 0.3)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </section>
  );
}
