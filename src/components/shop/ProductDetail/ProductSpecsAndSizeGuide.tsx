"use client";

import { useState } from 'react';
import { ArrowRight, Droplets, Waves, Sun, Dog, ShieldCheck, Check, X, Ruler, Sparkles, AlertCircle } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface SpecsAndSizeGuideProps {
  product?: Product;
  productDetails?: Record<string, string>;
}

export function ProductSpecsAndSizeGuide({ product, productDetails }: SpecsAndSizeGuideProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  let specsList: { label: string; value: string }[] = [];

  if (productDetails) {
    specsList = Object.entries(productDetails).map(([label, value]) => ({ label, value }));
  } else if (product) {
    specsList = [
      { label: 'Brand', value: product.brand || 'KickAt' },
      { label: 'Category', value: product.mainCategory || 'Pet Essentials' },
      ...(product.petSpecies
        ? [{ label: 'Suitable For', value: `${product.petSpecies.charAt(0).toUpperCase()}${product.petSpecies.slice(1).toLowerCase()}s` }]
        : [{ label: 'Suitable For', value: 'All Pets' }]),
      ...(product.dietaryPreference
        ? [{ label: 'Dietary Type', value: product.dietaryPreference === 'VEG' ? 'Vegetarian' : 'Non-Vegetarian' }]
        : []),
      ...(product.materials ? [{ label: 'Material', value: product.materials }] : []),
      { label: 'Product Type', value: product.type === 'VARIABLE' ? 'Multi-Variant Pack' : 'Standard Pack' },
      { label: 'Availability', value: (product.stock ?? 100) > 0 ? 'In Stock' : 'Out of Stock' },
      { label: 'Country of Origin', value: 'India' },
    ];

    if (product.attributes && typeof product.attributes === 'object') {
      const excludedKeys = new Set(['ingredients', 'feedingGuide', 'description', 'highlights', 'images', 'media', 'careInstructions', 'sizeGuide']);
      Object.entries(product.attributes).forEach(([key, val]) => {
        if (!excludedKeys.has(key.toLowerCase()) && (typeof val === 'string' || typeof val === 'number')) {
          // If the text is reasonable length (< 120 chars), include in specs
          if (String(val).length < 120) {
            const formattedLabel = key.replace(/([A-Z])/g, ' ').replace(/^./, str => str.toUpperCase());
            specsList.push({ label: formattedLabel, value: String(val) });
          }
        }
      });
    }
  } else {
    specsList = [
      { label: 'Brand', value: 'KickAt' },
      { label: 'Material', value: 'Pet-Safe Material' },
      { label: 'Suitable For', value: 'All Pets' },
      { label: 'Country of Origin', value: 'India' },
    ];
  }

  // Variant size cards if variants exist
  const variants = product?.variants || [];
  const hasVariants = variants.length > 0;

  return (
    <div className={styles.specsSizeSectionGrid}>
      {/* Left Column: Specifications Card */}
      <div className={styles.specsCard}>
        <div className={styles.specsCardHeader}>
          <h3 className={styles.specsCardTitle}>Product Specifications</h3>
          <span className={styles.specsVerifiedBadge}>
            <ShieldCheck size={14} color="#2E7D32" />
            <span>100% Genuine</span>
          </span>
        </div>

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
          <div className={styles.sizeGuideHeaderTitleGroup}>
            <h3 className={styles.sizeGuideTitle}>Size &amp; Storage Guide</h3>
            <span className={styles.sizeGuideSubtitle}>Recommended for optimal freshness and comfort.</span>
          </div>
        </div>

        {/* Variant Size Pills / Cards */}
        {hasVariants ? (
          <div className={styles.variantGuideBlock}>
            <span className={styles.variantGuideLabel}>Available Options:</span>
            <div className={styles.variantPillsList}>
              {variants.map((v) => (
                <div key={v.id} className={styles.variantGuidePill}>
                  <span className={styles.variantGuideName}>{v.name}</span>
                  <span className={styles.variantGuidePrice}>
                    ₹{(v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.sizeCardsRow}>
            <div className={styles.sizeCardTile}>
              <span className={styles.sizeCardLetter}>S</span>
              <span className={styles.sizeCardWeight}>Small Pets (&lt;5 kg)</span>
              <div className={styles.sizeCardDogIconWrap}>
                <Dog size={22} className={styles.dogIconDefault} />
              </div>
            </div>
            <div className={`${styles.sizeCardTile} ${styles.sizeCardActive}`}>
              <span className={styles.sizeCardLetter}>M</span>
              <span className={styles.sizeCardWeight}>Medium (5–15 kg)</span>
              <div className={styles.sizeCardDogIconWrap}>
                <Dog size={22} className={styles.dogIconActive} />
              </div>
            </div>
            <div className={styles.sizeCardTile}>
              <span className={styles.sizeCardLetter}>L</span>
              <span className={styles.sizeCardWeight}>Large (15–30 kg)</span>
              <div className={styles.sizeCardDogIconWrap}>
                <Dog size={22} className={styles.dogIconDefault} />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className={styles.viewDetailedSizeGuideLink}
          onClick={() => setIsModalOpen(true)}
        >
          <Ruler size={14} />
          <span>Need help choosing? View sizing tips</span>
          <ArrowRight size={14} />
        </button>

        {/* Storage & Care Instructions */}
        <div className={styles.careSection}>
          <h4 className={styles.careTitle}>Storage &amp; Care Recommendations</h4>
          <div className={styles.careItemsRow}>
            <div className={styles.careItem}>
              <Sun size={17} className={styles.careIcon} />
              <span>Keep away from direct heat</span>
            </div>
            <div className={styles.careItem}>
              <Droplets size={17} className={styles.careIcon} />
              <span>Store in a cool, dry place</span>
            </div>
            <div className={styles.careItem}>
              <Sparkles size={17} className={styles.careIcon} />
              <span>Reseal pack after opening</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Dialogue Modal */}
      {isModalOpen && (
        <div className={styles.sizeModalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.sizeModalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.sizeModalCloseBtn}
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className={styles.sizeModalHeader}>
              <h3 className={styles.sizeModalTitle}>Pet Sizing &amp; Portion Guidance</h3>
              <p className={styles.sizeModalSubtitle}>
                Select the right portion or size based on your pet&apos;s breed and weight.
              </p>
            </div>

            <div className={styles.modalTipsList}>
              <div className={styles.modalTipItem}>
                <strong>Puppies &amp; Small Breeds:</strong> Recommended daily portion: 50g–120g split across 2–3 meals.
              </div>
              <div className={styles.modalTipItem}>
                <strong>Adult Dogs (Medium):</strong> Recommended daily portion: 150g–250g split across 2 meals.
              </div>
              <div className={styles.modalTipItem}>
                <strong>Adult Dogs (Large / Active):</strong> Recommended daily portion: 300g–450g daily.
              </div>
            </div>

            <div className={styles.careSection}>
              <h4 className={styles.careTitle}>Feeding Advice</h4>
              <p style={{ fontSize: '0.825rem', color: '#524D45', lineHeight: 1.5, margin: 0 }}>
                Transition gradually over 7 days when introducing new food or treats. Mix 25% new food with 75% current food on days 1–2, increasing gradually.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
