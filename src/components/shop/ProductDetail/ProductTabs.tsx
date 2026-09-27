"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Shield, Sparkles, Droplets, Heart, PawPrint } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface ProductTabsProps {
  product: Product;
}

type TabType = 'Details' | 'Materials' | 'Size & Fit' | 'Shipping & Returns';

const TABS: { id: TabType; label: string }[] = [
  { id: 'Details', label: 'Details' },
  { id: 'Materials', label: 'Materials' },
  { id: 'Size & Fit', label: 'Size & Fit' },
  { id: 'Shipping & Returns', label: 'Shipping & Returns' },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Details');

  const renderTabContent = (tab: TabType) => {
    switch (tab) {
      case 'Details':
        return (
          <div className={styles.tabDetailsGrid}>
            {/* Left Column: Description & Highlights */}
            <div className={styles.tabDetailsLeftCol}>
              <h3 className={styles.tabSectionHeading}>
                {product.descriptionTitle || 'Thoughtfully Crafted for Your Companion'}
              </h3>
              <p className={styles.tabMainParagraph}>
                {product.description || 'Crafted with premium materials for your pet’s health, comfort, and happiness. Engineered to withstand daily use while providing gentle care.'}
              </p>

              {/* 4 Feature Callouts Grid */}
              <div className={styles.calloutGrid}>
                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Shield size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Premium Quality</h4>
                    <p className={styles.calloutSub}>Tested for durability</p>
                  </div>
                </div>

                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Sparkles size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Gentle &amp; Safe</h4>
                    <p className={styles.calloutSub}>Veterinarian approved</p>
                  </div>
                </div>

                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Droplets size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Easy Maintenance</h4>
                    <p className={styles.calloutSub}>Hassle-free cleaning</p>
                  </div>
                </div>

                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Heart size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Non-Toxic &amp; Safe</h4>
                    <p className={styles.calloutSub}>100% pet-friendly materials</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Lifestyle Banner Image with Overlay */}
            <div className={styles.tabDetailsRightCol}>
              <div className={styles.lifestyleBannerWrap}>
                <Image
                  src={product.image || product.images?.[0] || "/hero-products/dog_food.png"}
                  alt={product.name || "Product lifestyle preview"}
                  fill
                  className={styles.lifestyleImage}
                  style={{ objectFit: 'contain' }}
                />
                {/* Cursive Overlay */}
                <div className={styles.cursiveOverlayText}>
                  <span>Play</span>
                  <span>Love</span>
                  <span>Cherish</span>
                  <span className={styles.cursiveHeart}>♡</span>
                </div>

                {/* Bottom Right Badge */}
                <div className={styles.lifestyleBadgeBottom}>
                  <PawPrint size={16} fill="#F99205" color="#F99205" />
                  <span>Happier Pets, Healthier Lives</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Materials':
        return (
          <p className={styles.tabTextContent}>
            {product.materials 
              ? product.materials 
              : '100% pet-safe, food-grade materials. Free from BPA, phthalates, and harsh chemical compounds. Sourced sustainably to ensure gentle, non-toxic contact with your pet.'}
          </p>
        );

      case 'Size & Fit':
        return (
          <p className={styles.tabTextContent}>
            Designed for optimal ergonomics and comfort. Available in multiple options to best suit your companion&apos;s size, breed, and weight requirements.
          </p>
        );

      case 'Shipping & Returns':
        return (
          <p className={styles.tabTextContent}>
            Enjoy free express shipping on eligible orders. Standard delivery time is 2-4 business days. Easy returns accepted within 7 days of delivery for eligible items.
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.tabsSectionContainer}>
      {/* Horizontal Tabs Header Bar */}
      <div className={styles.tabsHeaderNav}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabNavBtn} ${isActive ? styles.tabNavBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Body */}
      <div className={styles.tabPanelBody}>
        {renderTabContent(activeTab)}
      </div>
    </div>
  );
}
