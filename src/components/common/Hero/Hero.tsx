"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ChevronRight,
  Dog,
  Cat,
  Fish,
  Bird,
  Rabbit
} from 'lucide-react';
import styles from './Hero.module.css';

// Paw Print Watermark SVG
const PawWatermark = ({ className, size = 56 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5.5" cy="8.5" r="2" />
    <circle cx="9.5" cy="5" r="2.2" />
    <circle cx="14.5" cy="5" r="2.2" />
    <circle cx="18.5" cy="8.5" r="2" />
    <path d="M12 9.5c-3.2 0-5.5 2.5-5.5 5.5 0 2.2 1.8 4 4 4 1 0 1.2-.5 1.5-.5s.5.5 1.5.5c2.2 0 4-1.8 4-4 0-3-2.3-5.5-5.5-5.5z" />
  </svg>
);

// Heart Doodle SVG
const HeartDoodle = ({ className }: { className?: string }) => (
  <svg className={className} width="36" height="36" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 27 C16 27, 4 19, 4 11 C4 6.5, 7.5 3, 12 3 C14.5 3, 15.5 4.5, 16 5.5 C16.5 4.5, 17.5 3, 20 3 C24.5 3, 28 6.5, 28 11 C28 19, 16 27, 16 27 Z" />
  </svg>
);

// Diagonal Sparkle / Motion Accent Cluster
const MotionAccents = ({ className }: { className?: string }) => (
  <svg className={className} width="30" height="24" viewBox="0 0 28 22" fill="none" aria-hidden="true">
    <line x1="6" y1="18" x2="14" y2="4" stroke="#EE8C32" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="16" y1="20" x2="24" y2="6" stroke="#EE8C32" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

// Hand-drawn flourish for "Pets Make Life Better"
const SwirlFlourish = ({ className }: { className?: string }) => (
  <svg className={className} width="145" height="14" viewBox="0 0 140 14" fill="none" aria-hidden="true">
    <path d="M2 10C35 3 88 2 138 9" stroke="#EE8C32" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

function HeroComponent() {
  return (
    <section className={styles.hero} aria-label="Welcome to KickAt">
      {/* Decorative Organic Background Glows & Repositioned Watermarks */}
      <div className={styles.bgGlowTopRight} aria-hidden="true" />
      <div className={styles.bgGlowBottomLeft} aria-hidden="true" />

      {/* Scattered watermarks */}
      <PawWatermark className={styles.watermark + ' ' + styles.watermarkLowerLeft} size={64} />
      <PawWatermark className={styles.watermark + ' ' + styles.watermarkUpperRight} size={76} />

      {/* Main Hero Content Area */}
      <div className={styles.container}>
        
        {/* ── 1. LEFT CONTENT AREA ── */}
        <div className={styles.leftContent}>
          
          {/* Trust Badge */}
          <Link href="/testimonials" className={styles.trustPill} title="See customer reviews">
            <div className={styles.pillAvatars}>
              <span className={styles.avatarEmoji} role="img" aria-label="Dog">🐶</span>
              <span className={styles.avatarEmoji} role="img" aria-label="Cat">🐱</span>
              <span className={styles.avatarEmoji} role="img" aria-label="Rabbit">🐰</span>
              <span className={styles.avatarEmoji} role="img" aria-label="Bird">🐦</span>
            </div>
            <span className={styles.pillText}>Trusted by 25K+ Pet Parents</span>
            <ChevronRight size={15} strokeWidth={2.5} className={styles.pillArrow} />
          </Link>

          {/* Main Headline */}
          <h1 className={styles.headline}>
            <span className={styles.headlineNavy}>Everything Your</span>
            <span className={styles.headlineOrangeWrap}>
              <span className={styles.headlineOrange}>Pet Deserves</span>
              <HeartDoodle className={styles.headlineHeart} />
            </span>
          </h1>

          {/* Supporting Subheadline */}
          <p className={styles.supportingText}>
            Premium food, treats, toys and everyday essentials &mdash; 
            <span className={styles.desktopBr} />
            for every tail, whisker, fin and feather.
          </p>

          {/* Call-to-Action Buttons */}
          <div className={styles.ctaRow}>
            <Link href="/shop" className={styles.primaryCta}>
              <span>Shop Now</span>
              <ArrowRight size={18} strokeWidth={2.5} className={styles.ctaArrow} />
            </Link>

            <Link href="/category" className={styles.secondaryCta}>
              <span>Explore Categories</span>
              <ArrowRight size={18} strokeWidth={2} className={styles.ctaArrow} />
            </Link>
          </div>
          
        </div>

        {/* ── 2. RIGHT HERO VISUAL (SEAMLESS PAW ARTWORK) ── */}
        <div className={styles.rightVisual} aria-label="Pet Category Showcase">
          
          {/* Ambient backdrop glow behind image */}
          <div className={styles.pawBackdropGlow} aria-hidden="true" />

          {/* Dashed trajectory curve over paw */}
          <svg className={styles.dashedCurveTop} viewBox="0 0 170 70" fill="none" aria-hidden="true">
            <path d="M 10 55 C 60 10, 125 10, 160 45" stroke="#E89A5A" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.65" />
          </svg>

          {/* Diagonal motion accents */}
          <MotionAccents className={styles.motionAccentsTop} />
          <MotionAccents className={styles.motionAccentsRight} />

          {/* Right trajectory note: 'For a kinder, happier world ♡' */}
          <div className={styles.sideNoteWrapper} aria-hidden="true">
            <svg className={styles.sideDashedCurve} viewBox="0 0 70 45" fill="none">
              <path d="M 5 10 C 35 8, 55 25, 40 40" stroke="#E89A5A" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.6" />
            </svg>
            <div className={styles.sideNote}>
              <span>For a</span>
              <span>kinder, happier</span>
              <span>world ♡</span>
            </div>
          </div>

          {/* Seamless Paw Illustration Container */}
          <div className={styles.pawImageContainer}>
            <div className={styles.pawImageWrapper}>
              <Image
                src="/hero.png"
                alt="Happier Pets, Brighter Days - Food & Treats, Toys & Playtime, Beds & Accessories, Health & Grooming"
                width={1400}
                height={787}
                priority
                unoptimized
                draggable={false}
                className={styles.heroPawImage}
              />

              {/* Interactive Category Hotspots */}
              <Link 
                href="/category/dogs/dog-accessories" 
                className={styles.hotspot + ' ' + styles.hotspotBeds}
                title="Shop Beds & Accessories"
                aria-label="Shop Beds & Accessories"
              />
              <Link 
                href="/category/dogs/dog-food-treats" 
                className={styles.hotspot + ' ' + styles.hotspotFood}
                title="Shop Food & Treats"
                aria-label="Shop Food & Treats"
              />
              <Link 
                href="/category/dogs/dog-accessories" 
                className={styles.hotspot + ' ' + styles.hotspotToys}
                title="Shop Toys & Playtime"
                aria-label="Shop Toys & Playtime"
              />
              <Link 
                href="/category/dogs/dog-grooming-hygiene" 
                className={styles.hotspot + ' ' + styles.hotspotHealth}
                title="Shop Health & Grooming"
                aria-label="Shop Health & Grooming"
              />
              <Link 
                href="/category" 
                className={styles.hotspot + ' ' + styles.hotspotPad}
                title="Explore All Categories"
                aria-label="Explore All Categories"
              />
            </div>
          </div>

        </div>

      </div>

      {/* ── 3. BOTTOM CATEGORY NAVIGATION STRIP ── */}
      <div className={styles.bottomNavStrip}>
        <div className={styles.bottomNavContainer}>
          
          <div className={styles.categoryLinksRow}>
            <Link href="/category/dogs" className={styles.catLinkItem}>
              <Dog size={20} className={styles.catLinkIcon} />
              <span>Dogs</span>
            </Link>
            <span className={styles.catDivider} aria-hidden="true">|</span>

            <Link href="/category/cats" className={styles.catLinkItem}>
              <Cat size={20} className={styles.catLinkIcon} />
              <span>Cats</span>
            </Link>
            <span className={styles.catDivider} aria-hidden="true">|</span>

            <Link href="/category/fish" className={styles.catLinkItem}>
              <Fish size={20} className={styles.catLinkIcon} />
              <span>Fish</span>
            </Link>
            <span className={styles.catDivider} aria-hidden="true">|</span>

            <Link href="/category/birds" className={styles.catLinkItem}>
              <Bird size={20} className={styles.catLinkIcon} />
              <span>Birds</span>
            </Link>
            <span className={styles.catDivider} aria-hidden="true">|</span>

            <Link href="/category" className={styles.catLinkItem}>
              <Rabbit size={20} className={styles.catLinkIcon} />
              <span>Small Pets</span>
            </Link>
          </div>

          <div className={styles.bottomHandwrittenTag}>
            <span className={styles.handwrittenPhrase}>Pets Make Life Better ♡</span>
            <SwirlFlourish className={styles.swirlFlourish} />
          </div>

        </div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroComponent);
