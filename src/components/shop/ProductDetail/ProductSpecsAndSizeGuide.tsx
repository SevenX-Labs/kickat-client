"use client";

import { ArrowRight, Droplets, Waves, Sun, Dog } from 'lucide-react';
import styles from './ProductDetail.module.css';

interface SpecsAndSizeGuideProps {
  productDetails?: Record<string, string>;
}

const DEFAULT_SPECS = [
  { label: 'Brand', value: 'Mim & Mate' },
  { label: 'Material', value: 'Natural Rubber' },
  { label: 'Suitable for', value: 'Dogs' },
  { label: 'Life Stage', value: 'Puppy & Adult' },
  { label: 'Size', value: 'S / M / L' },
  { label: 'Color', value: 'Charcoal & Pumpkin, Beige' },
  { label: 'Weight', value: '180 g (Medium)' },
  { label: 'Country of Origin', value: 'India' },
];

const SIZE_CARDS = [
  { size: 'S', weight: 'Up to 5 kg', active: false },
  { size: 'M', weight: '5 – 15 kg', active: true },
  { size: 'L', weight: '15 – 30 kg', active: false },
];

export function ProductSpecsAndSizeGuide({ productDetails }: SpecsAndSizeGuideProps) {

  const specsList = productDetails
    ? Object.entries(productDetails).map(([label, value]) => ({ label, value }))
    : DEFAULT_SPECS;

  return (
    <div className={styles.specsSizeSectionGrid}>
      {/* Left Column: Product Details */}
      <div className={styles.specsCard}>
        <h3 className={styles.specsCardTitle}>Product Details</h3>
        <div className={styles.specsTable}>
          {specsList.map((item, idx) => (
            <div key={idx} className={styles.specsTableRow}>
              <span className={styles.specsLabel}>{item.label}</span>
              <span className={styles.specsValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Size Guide & Care Instructions */}
      <div className={styles.sizeGuideCard}>
        <div className={styles.sizeGuideHeader}>
          <h3 className={styles.sizeGuideTitle}>Size Guide</h3>
          <p className={styles.sizeGuideSubtitle}>Choose the right size for your dog.</p>
        </div>

        {/* 3 Size Cards (Static reference guide) */}
        <div className={styles.sizeCardsRow}>
          {SIZE_CARDS.map((card) => (
            <div key={card.size} className={styles.sizeCardTile}>
              <span className={styles.sizeCardLetter}>{card.size}</span>
              <span className={styles.sizeCardWeight}>{card.weight}</span>
              <div className={styles.sizeCardDogIconWrap}>
                <Dog size={28} className={styles.dogIconDefault} />
              </div>
            </div>
          ))}
        </div>

        <button type="button" className={styles.viewDetailedSizeGuideLink}>
          <span>Not sure? View detailed size guide</span>
          <ArrowRight size={14} />
        </button>

        {/* Care Instructions Mini-Section */}
        <div className={styles.careSection}>
          <h4 className={styles.careTitle}>Care Instructions</h4>
          <div className={styles.careItemsRow}>
            <div className={styles.careItem}>
              <Droplets size={18} className={styles.careIcon} />
              <span>Wash with mild soap</span>
            </div>
            <div className={styles.careItem}>
              <Waves size={18} className={styles.careIcon} />
              <span>Rinse thoroughly</span>
            </div>
            <div className={styles.careItem}>
              <Sun size={18} className={styles.careIcon} />
              <span>Air dry completely</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
