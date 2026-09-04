"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Shield, Sparkles, Droplets, Heart, PawPrint } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface ProductTabsProps {
  product: Product;
}

const TABS = [
  { id: 'Details', label: 'Details' },
  { id: 'Materials', label: 'Materials' },
  { id: 'Size & Fit', label: 'Size & Fit' },
  { id: 'Shipping & Returns', label: 'Shipping & Returns' },
  { id: 'Reviews', label: 'Reviews (64)' },
  { id: 'FAQs', label: 'FAQs' },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('Details');

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'Details':
        return (
          <div className={styles.tabDetailsContainer}>
            {/* Left Column: Text & 2x2 Callouts Grid */}
            <div className={styles.tabDetailsLeftCol}>
              <h3 className={styles.tabDetailsHeading}>Why your pet will love it</h3>
              <p className={styles.tabDetailsParagraph}>
                Made from high-quality, pet-safe natural rubber, this chew toy is designed to keep your dog engaged, active, and happy. Perfect for chewing, fetching, and daily play while supporting dental health.
              </p>

              <div className={styles.calloutGrid2x2}>
                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Shield size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Durable natural rubber</h4>
                    <p className={styles.calloutSub}>Built to last</p>
                  </div>
                </div>

                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Sparkles size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Gentle on teeth &amp; gums</h4>
                    <p className={styles.calloutSub}>Supports dental health</p>
                  </div>
                </div>

                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Droplets size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Easy to clean</h4>
                    <p className={styles.calloutSub}>Hassle-free maintenance</p>
                  </div>
                </div>

                <div className={styles.calloutItem}>
                  <div className={styles.calloutIconWrap}>
                    <Heart size={20} className={styles.calloutIcon} />
                  </div>
                  <div>
                    <h4 className={styles.calloutTitle}>Non-toxic &amp; pet-safe</h4>
                    <p className={styles.calloutSub}>Safe for everyday use</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Lifestyle Banner Image with Overlay */}
            <div className={styles.tabDetailsRightCol}>
              <div className={styles.lifestyleBannerWrap}>
                <Image
                  src={product.image || "/hero-products/dog_food.png"}
                  alt="Puppy playing with chew toy"
                  fill
                  className={styles.lifestyleImage}
                />
                {/* Cursive Overlay */}
                <div className={styles.cursiveOverlayText}>
                  <span>Play</span>
                  <span>Chew</span>
                  <span>Repeat</span>
                  <span className={styles.cursiveHeart}>♡</span>
                </div>

                {/* Bottom Right Badge */}
                <div className={styles.lifestyleBadgeBottom}>
                  <PawPrint size={16} fill="#FD802E" color="#FD802E" />
                  <span>Happier Pets, Healthier Lives</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Materials':
        return (
          <p className={styles.tabTextContent}>
            100% natural food-grade rubber. Free from BPA, phthalates, and harsh chemical compounds. Sourced sustainably to ensure gentle, non-abrasive contact with your pet&apos;s mouth.
          </p>
        );

      case 'Size & Fit':
        return (
          <p className={styles.tabTextContent}>
            Available in Small (under 5kg), Medium (5-15kg), and Large (15-30kg). Please pick a size larger than your dog&apos;s mouth width to avoid choking hazards during intense play.
          </p>
        );

      case 'Shipping & Returns':
        return (
          <p className={styles.tabTextContent}>
            Enjoy free express shipping on all orders over ₹999. Standard delivery time is 2-4 business days. Returns accepted within 7 days of delivery for un-opened or defective items.
          </p>
        );

      case 'Reviews':
        return (
          <p className={styles.tabTextContent}>
            Rated 4.8 / 5 based on 64 verified buyer reviews. Scroll down to see full customer ratings and photos.
          </p>
        );

      case 'FAQs':
        return (
          <p className={styles.tabTextContent}>
            Q: Is this toy suitable for aggressive chewers?<br />
            A: Yes! Crafted from thick natural rubber, it is engineered for heavy play and moderate chewing routines.
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
