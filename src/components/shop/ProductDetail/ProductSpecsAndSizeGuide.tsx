"use client";

import { ArrowRight, Droplets, Waves, Sun, Dog } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface SpecsAndSizeGuideProps {
  product?: Product;
  productDetails?: Record<string, string>;
}

const SIZE_CARDS = [
  { size: 'S', weight: 'Up to 5 kg', active: false },
  { size: 'M', weight: '5 – 15 kg', active: true },
  { size: 'L', weight: '15 – 30 kg', active: false },
];

export function ProductSpecsAndSizeGuide({ product, productDetails }: SpecsAndSizeGuideProps) {
  let specsList: { label: string; value: string }[] = [];

  if (productDetails) {
    specsList = Object.entries(productDetails).map(([label, value]) => ({ label, value }));
  } else if (product) {
    specsList = [
      { label: 'Brand', value: product.brand || 'KickAt' },
      { label: 'Category', value: product.mainCategory || 'Pet Essentials' },
      { label: 'Suitable for', value: product.petSpecies ? `${product.petSpecies.charAt(0).toUpperCase()}${product.petSpecies.slice(1).toLowerCase()}s` : 'All Pets' },
      ...(product.materials ? [{ label: 'Material', value: product.materials }] : []),
      ...(product.dietaryPreference ? [{ label: 'Dietary Type', value: product.dietaryPreference.replace('_', ' ') }] : []),
      { label: 'Type', value: product.type === 'VARIABLE' ? 'Multi-Variant' : 'Standard' },
      { label: 'Availability', value: (product.stock ?? 100) > 0 ? 'In Stock' : 'Out of Stock' },
      { label: 'Country of Origin', value: 'India' },
    ];

    if (product.attributes && typeof product.attributes === 'object') {
      Object.entries(product.attributes).forEach(([key, val]) => {
        if (typeof val === 'string' || typeof val === 'number') {
          const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          specsList.push({ label: formattedLabel, value: String(val) });
        }
      });
    }
  } else {
    specsList = [
      { label: 'Brand', value: 'KickAt' },
      { label: 'Material', value: 'Pet-Safe Material' },
      { label: 'Suitable for', value: 'All Pets' },
      { label: 'Life Stage', value: 'All Ages' },
      { label: 'Country of Origin', value: 'India' },
    ];
  }

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
          <p className={styles.sizeGuideSubtitle}>Choose the right size for your pet.</p>
        </div>

        {/* 3 Size Cards */}
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
          <span>Not sure? View recommendations</span>
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
