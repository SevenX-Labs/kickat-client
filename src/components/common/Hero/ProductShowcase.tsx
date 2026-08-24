"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ProductShowcase.module.css';

const products = [
  {
    id: 1,
    name: "Premium Canine Nourish",
    price: "₹1,299",
    image: "/hero-products/dog_food.png",
    label: "Holistic Dog Food",
  },
  {
    id: 2,
    name: "KittyHaus Sea Catch",
    price: "₹499",
    image: "/hero-products/cat_treats.png",
    label: "Premium Cat Treats",
  },
  {
    id: 3,
    name: "Mim & Mate Natural Chew",
    price: "₹899",
    image: "/hero-products/pet_toy.png",
    label: "Aesthetic Chew Toy",
  },
  {
    id: 4,
    name: "Maison Petit Ceramic Bowl",
    price: "₹1,499",
    image: "/hero-products/pet_bowl.png",
    label: "Sleek Ceramic Bowl",
  }
];

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div 
      className={styles.showcase}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.glowBg}></div>
      
      <div className={styles.slidesContainer}>
        {products.map((product, index) => {
          const isActive = index === activeIndex;
          
          return (
            <div 
              key={product.id} 
              className={`${styles.slide} ${isActive ? styles.active : ''}`}
            >
              <div className={styles.productWrapper}>
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  className={styles.productImage}
                  priority={index === 0}
                />
                
                <div className={styles.productTooltip}>
                  <div className={styles.tooltipLabel}>{product.label}</div>
                  <div className={styles.tooltipName}>{product.name}</div>
                  <div className={styles.tooltipFooter}>
                    <span className={styles.tooltipPrice}>{product.price}</span>
                    <span className={styles.tooltipAction}>View product &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.indicatorContainer}>
        <div className={styles.indicatorText}>
          0{activeIndex + 1} <span style={{ opacity: 0.4 }}>/ 0{products.length}</span>
        </div>
        <div className={styles.progressBars}>
          {products.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`${styles.progressBar} ${idx === activeIndex ? styles.progressActive : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
