"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck,
  RotateCcw,
  Headset,
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

// Standardized Diagonal Sparkle / Motion Accent Cluster
const MotionAccents = ({ className }: { className?: string }) => (
  <svg className={className} width="32" height="26" viewBox="0 0 32 26" fill="none" aria-hidden="true">
    <line x1="6" y1="22" x2="16" y2="4" stroke="#EE8C32" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="18" y1="24" x2="28" y2="6" stroke="#EE8C32" strokeWidth="2.5" strokeLinecap="round" />
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
          
          {/* Trust Badge Pill */}
          <Link href="/testimonials" className={styles.trustPill} title="See customer reviews">
            <div className={styles.pillAvatars}>
              <span className={styles.avatarEmoji} role="img" aria-label="Dog">🐶</span>
              <span className={styles.avatarEmoji} role="img" aria-label="Cat">🐱</span>
              <span className={styles.avatarEmoji} role="img" aria-label="Rabbit">🐰</span>
              <span className={styles.avatarEmoji} role="img" aria-label="Bird">🐦</span>
            </div>
            <span className={styles.pillText}>Trusted by 5 Lakh+ Pet Parents</span>
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
              <ArrowRight size={18} strokeWidth={2.5} className={styles.ctaArrow} />
            </Link>
          </div>

          {/* Trust & Guarantee Benefit Indicators Row */}
          <div className={styles.benefitRow}>

            <div className={styles.benefitItem}>
              <div className={styles.benefitIconWrap}>
                <ShieldCheck size={19} strokeWidth={2} />
              </div>
              <div className={styles.benefitText}>
                <span className={styles.benefitTitle}>100% Genuine</span>
                <span className={styles.benefitSub}>Products</span>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitIconWrap}>
                <RotateCcw size={19} strokeWidth={2} />
              </div>
              <div className={styles.benefitText}>
                <span className={styles.benefitTitle}>Easy Returns</span>
                <span className={styles.benefitSub}>Hassle-free</span>
              </div>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitIconWrap}>
                <Headset size={19} strokeWidth={2} />
              </div>
              <div className={styles.benefitText}>
                <span className={styles.benefitTitle}>Dedicated Support</span>
                <span className={styles.benefitSub}>For pet parents</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* ── 2. RIGHT HERO VISUAL (LIFESTYLE PHOTO + INTENTIONAL ORGANIC STAGE) ── */}
        <div className={styles.rightVisual} aria-label="Pet Category Showcase">
          
          {/* Intentional Organic Stage Backdrop */}
          <div className={styles.pawBackdropGlow} aria-hidden="true" />

          {/* Standardized decorative accents framing the photo */}
          <MotionAccents className={styles.motionAccentsTop} />
          <MotionAccents className={styles.motionAccentsRight} />

          {/* Right hand-written note: 'For a kinder, happier world ♡' */}
          <div className={styles.sideNoteWrapper} aria-hidden="true">
            <svg className={styles.sideDashedCurve} viewBox="0 0 70 45" fill="none">
              <path d="M 5 10 C 35 8, 55 25, 40 40" stroke="#EE8C32" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.65" />
            </svg>
            <div className={styles.sideNote}>
              <span>For a</span>
              <span>kinder, happier</span>
              <span>world ♡</span>
            </div>
          </div>

          {/* Studio Pet & Product Image Container */}
          <div className={styles.pawImageContainer}>
            <div className={styles.pawImageWrapper}>
              <Image
                src="/hero.png"
                alt="Happier Pets, Brighter Days - Food & Treats, Toys & Playtime, Beds & Accessories, Health & Grooming"
                width={1238}
                height={941}
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
