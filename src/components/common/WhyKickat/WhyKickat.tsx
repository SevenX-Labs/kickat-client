"use client";

import { useEffect, useRef, useState } from 'react';
import { Stethoscope, Leaf, Heart, Truck, Shield, Award, Quote } from 'lucide-react';
import styles from './WhyKickat.module.css';

const heroStats = [
  {
    icon: Heart,
    value: 25000,
    suffix: '+',
    display: '25K+',
    label: 'HAPPY PETS',
    description: 'Trusted by pet parents across the country who refuse to compromise on quality.',
  },
  {
    icon: Stethoscope,
    value: 50,
    suffix: '+',
    display: '50+',
    label: 'VET PARTNERS',
    description: 'Every recipe formulated alongside leading veterinary nutritionists.',
  },
  {
    icon: Leaf,
    value: 100,
    suffix: '%',
    display: '100%',
    label: 'NATURAL',
    description: 'Human-grade ingredients. No fillers, no artificial preservatives, ever.',
  },
];

const secondaryStats = [
  { icon: Truck, value: '2–3 Day', label: 'FREE DELIVERY' },
  { icon: Shield, value: '200+', label: 'TRUSTED BRANDS' },
  { icon: Award, value: '30 Day', label: 'EASY RETURNS' },
];

function useCountUp(end: number, duration: number, startCounting: boolean) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startCounting) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, startCounting]);

  return count;
}

function HeroStatCard({ stat, index, isVisible }: { stat: typeof heroStats[0]; index: number; isVisible: boolean }) {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, 2000, isVisible);

  const formatCount = (val: number) => {
    if (stat.value >= 1000) {
      return Math.floor(val / 1000) + 'K';
    }
    return val.toString();
  };

  return (
    <div
      className={styles.heroCard}
      style={{
        animationDelay: `${index * 120}ms`,
        animationPlayState: isVisible ? 'running' : 'paused',
      }}
    >
      <Icon className={styles.heroIcon} strokeWidth={1.25} />
      <div className={styles.heroValue}>
        {isVisible ? formatCount(count) : '0'}{stat.suffix}
      </div>
      <div className={styles.heroLabel}>{stat.label}</div>
      <p className={styles.heroDesc}>{stat.description}</p>
    </div>
  );
}

export function WhyKickat() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Left-aligned header */}
          <div className={styles.header}>
            <span className={styles.eyebrow}>Why choose us</span>
            <h2 className={styles.title}>
              Why <em className={styles.titleAccent}>KickAt</em>?
            </h2>
          </div>

          {/* Hero stats row */}
          <div className={`${styles.heroRow} ${isVisible ? styles.heroRowVisible : ''}`}>
            {heroStats.map((stat, idx) => (
              <HeroStatCard key={idx} stat={stat} index={idx} isVisible={isVisible} />
            ))}
          </div>
        </div>

        {/* Right visual anchor — pull-quote */}
        <div className={`${styles.quoteCard} ${isVisible ? styles.quoteVisible : ''}`}>
          <Quote className={styles.quoteIcon} strokeWidth={1} />
          <blockquote className={styles.quoteText}>
            KickAt completely changed how I feed my dog. The quality is unmatched and Max has never been healthier.
          </blockquote>
          <div className={styles.quoteAuthor}>
            <div className={styles.authorAvatar}>P</div>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>Priya Sharma</span>
              <span className={styles.authorRole}>Pet parent · Golden Retriever</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary trust strip */}
      <div className={styles.secondaryStrip}>
        <div className={styles.secondaryInner}>
          {secondaryStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={styles.secondaryItem}>
                <div className={styles.secondaryIconWrap}>
                  <Icon className={styles.secondaryIcon} strokeWidth={1.5} />
                </div>
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
