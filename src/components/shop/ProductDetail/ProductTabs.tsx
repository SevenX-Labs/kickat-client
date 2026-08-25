"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Shield, CheckCircle2, Droplets, Maximize } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface ProductTabsProps {
  product: Product;
}

const TABS = ['Details', 'Materials', 'Size & Fit', 'Shipping & Returns'];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const renderTabContent = (tab: string) => {
    switch(tab) {
      case 'Details':
        return (
          <div className={styles.detailsGrid}>
            <div className={styles.detailsTextCol}>
              <h3 className={styles.detailsHeading}>Why you&apos;ll love it</h3>
              <p className={styles.tabText}>
                Crafted from high-quality, pet-safe materials, this product delivers unmatched durability and comfort. The optimized design makes it a versatile staple for your pet&apos;s daily routine.
              </p>
              <div className={styles.featureCards}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconWrapper}><Shield size={20} /></div>
                  <span className={styles.featureCardText}>Premium pet-safe materials</span>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconWrapper}><CheckCircle2 size={20} /></div>
                  <span className={styles.featureCardText}>Designed for durability</span>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconWrapper}><Droplets size={20} /></div>
                  <span className={styles.featureCardText}>Easy to clean and maintain</span>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconWrapper}><Maximize size={20} /></div>
                  <span className={styles.featureCardText}>Modern, minimal aesthetic</span>
                </div>
              </div>
            </div>
            <div className={styles.detailsImageCol}>
              <div className={styles.detailsImageWrapper}>
                <Image 
                  src={product.images && product.images.length > 0 ? product.images[0] : "/hero-products/dog_food.png"} 
                  alt={product.name || "Product details"} 
                  fill 
                  className={styles.detailsImage} 
                />
              </div>
            </div>
          </div>
        );
      case 'Materials':
        return (
          <p className={styles.tabText}>
            Made from durable, non-toxic materials. We source our components ethically to ensure the highest quality while keeping your pet&apos;s health and safety as our top priority.
          </p>
        );
      case 'Size & Fit':
        return (
          <p className={styles.tabText}>
            Please refer to the sizing guide for exact measurements. We recommend measuring your pet before purchasing to ensure the perfect fit for their comfort and safety.
          </p>
        );
      case 'Shipping & Returns':
        return (
          <p className={styles.tabText}>
            We offer free standard shipping on all orders over ₹999. Standard delivery takes 3-5 business days. If you&apos;re not completely satisfied, you can return your items within 30 days of delivery for a full refund.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.tabsContainer}>
      {/* Desktop Tabs */}
      <div className={styles.desktopTabs}>
        <div className={styles.tabHeaders}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.tabContent}>
          <div className={styles.tabTextContent}>
            {renderTabContent(activeTab)}
          </div>
        </div>
      </div>

      {/* Mobile Accordion */}
      <div className={styles.mobileAccordion}>
        {TABS.map(tab => (
          <div key={tab} className={styles.accordionItem}>
            <button
              className={`${styles.accordionBtn} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(activeTab === tab ? '' : tab)}
            >
              {tab}
              <span className={styles.accordionIcon}>{activeTab === tab ? '−' : '+'}</span>
            </button>
            <div className={`${styles.accordionContent} ${activeTab === tab ? styles.open : ''}`}>
              <div className={styles.accordionInner}>
                {renderTabContent(tab)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
