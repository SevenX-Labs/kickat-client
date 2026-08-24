"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PetCategories.module.css';

const categories = [
  { name: 'DOG', image: '/category-images/dog.png', link: '/shop/dogs', cta: 'Shop Dog' },
  { name: 'CAT', image: '/category-images/cat.png', link: '/shop/cats', cta: 'Shop Cat' },
  { name: 'FISH', image: '/category-images/fish.png', link: '/shop/fish', cta: 'Shop Fish' },
  { name: 'BIRD', image: '/category-images/bird.png', link: '/shop/birds', cta: 'Shop Bird' },
];

export function PetCategories() {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        {/* Left-aligned header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Browse by companion</span>
          <h2 className={styles.title}>Shop by Pet</h2>
        </div>

        <div className={`${styles.grid} ${isVisible ? styles.gridVisible : ''}`}>
          {categories.map((category, idx) => (
            <Link
              href={category.link}
              key={category.name}
              className={styles.card}
              style={{
                animationDelay: `${idx * 90}ms`,
                animationPlayState: isVisible ? 'running' : 'paused',
              }}
            >
              {/* Photo with double ring frame and soft glow */}
              <div className={styles.imageRing}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={category.image}
                    alt={`${category.name} category`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className={styles.image}
                  />
                </div>
              </div>

              <div className={styles.contentWrapper}>
                <h3 className={styles.name}>{category.name}</h3>
                <span className={styles.action}>
                  {category.cta} <span className={styles.arrow}>&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
