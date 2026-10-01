"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Utensils,
  BookOpen,
  Truck,
  RotateCcw,
  PackageCheck,
  Leaf,
  PawPrint,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product, ProductVariant } from './ProductDetail';

interface ProductTabsProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
}

export function ProductTabs({ product, selectedVariant }: ProductTabsProps) {
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('details');

  // Parse highlights safely without [object Object]
  let parsedHighlights: string[] = [];
  if (Array.isArray(product.highlights)) {
    parsedHighlights = product.highlights
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          return String(item.title || item.text || item.value || item.name || item.highlight || Object.values(item)[0] || '');
        }
        return String(item || '');
      })
      .filter((s: string) => s && s !== '[object Object]' && s.trim().length > 0);
  } else if (typeof product.highlights === 'object' && product.highlights !== null) {
    parsedHighlights = Object.values(product.highlights)
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          return String(item.title || item.text || item.value || item.name || item.highlight || Object.values(item)[0] || '');
        }
        return String(item || '');
      })
      .filter((s: string) => s && s !== '[object Object]' && s.trim().length > 0);
  } else if (typeof product.highlights === 'string' && product.highlights.trim().length > 0) {
    parsedHighlights = product.highlights.split(/[;,\n]/).map((s: string) => s.trim()).filter(Boolean);
  }

  // Parse ingredients
  let ingredientsText = '';
  if (typeof product.ingredients === 'string') {
    ingredientsText = product.ingredients;
  } else if (Array.isArray(product.ingredients)) {
    ingredientsText = product.ingredients.join(', ');
  } else if (typeof product.ingredients === 'object' && product.ingredients !== null) {
    ingredientsText = Object.values(product.ingredients).join(', ');
  }

  // Parse feeding guide
  let feedingText = '';
  if (typeof product.feedingGuide === 'string') {
    feedingText = product.feedingGuide;
  } else if (typeof product.feedingGuide === 'object' && product.feedingGuide !== null) {
    feedingText = Object.entries(product.feedingGuide)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
  }

  // Build dynamic tabs
  const tabs: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details & Highlights', icon: <FileText size={15} /> },
  ];

  if (ingredientsText || product.dietaryPreference) {
    tabs.push({ id: 'ingredients', label: 'Ingredients & Nutrition', icon: <Utensils size={15} /> });
  }

  if (feedingText) {
    tabs.push({ id: 'feeding', label: 'Feeding & Usage Guide', icon: <BookOpen size={15} /> });
  }

  if (product.materials) {
    tabs.push({ id: 'materials', label: 'Materials & Safety', icon: <ShieldCheck size={15} /> });
  }

  tabs.push({ id: 'shipping', label: 'Shipping & Returns', icon: <Truck size={15} /> });

  // Scroll detection for mobile indicators
  const checkScroll = useCallback(() => {
    const el = tabsNavRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsNavRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Re-check edge scroll indicators on activeTab change
  useEffect(() => {
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [activeTab, checkScroll]);

  // One-time gentle auto-scroll nudge on first mobile load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth > 768) return;

    try {
      const alreadyNudged = sessionStorage.getItem('kickat_tabs_nudged');
      if (alreadyNudged) return;

      const timer = setTimeout(() => {
        const el = tabsNavRef.current;
        if (!el || el.scrollLeft > 10) return;

        el.scrollTo({ left: 45, behavior: 'smooth' });

        const backTimer = setTimeout(() => {
          if (el && el.scrollLeft < 70) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          }
          try {
            sessionStorage.setItem('kickat_tabs_nudged', 'true');
          } catch {}
        }, 450);

        return () => clearTimeout(backTimer);
      }, 900);

      return () => clearTimeout(timer);
    } catch {
      // storage fallback
    }
  }, []);

  const goToTabByIndex = (index: number) => {
    if (index < 0 || index >= tabs.length) return;
    const targetTab = tabs[index];
    setActiveTab(targetTab.id);
    const btnEl = tabsNavRef.current?.children[index] as HTMLElement;
    btnEl?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const handleTabClick = (tabId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tabId);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const hasPrevTab = currentTabIndex > 0;
  const hasNextTab = currentTabIndex >= 0 && currentTabIndex < tabs.length - 1;
  const showLeftArrow = hasPrevTab || canScrollLeft;
  const showRightArrow = hasNextTab || canScrollRight;

  const handlePrevTab = () => {
    const prevIdx = currentTabIndex > 0 ? currentTabIndex - 1 : 0;
    if (prevIdx !== currentTabIndex && prevIdx >= 0) {
      goToTabByIndex(prevIdx);
    } else {
      tabsNavRef.current?.scrollBy({ left: -140, behavior: 'smooth' });
    }
  };

  const handleNextTab = () => {
    const nextIdx = currentTabIndex >= 0 ? currentTabIndex + 1 : 1;
    if (nextIdx < tabs.length) {
      goToTabByIndex(nextIdx);
    } else {
      tabsNavRef.current?.scrollBy({ left: 140, behavior: 'smooth' });
    }
  };

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'details':
        return (
          <div className={styles.tabDetailsGrid}>
            {/* Left Column: Description & Highlights (only if genuine highlights exist) */}
            <div className={styles.tabDetailsLeftCol}>
              <h3 className={styles.tabSectionHeading}>
                {product.descriptionTitle || `Why Choose ${product.name}?`}
              </h3>
              <p className={styles.tabMainParagraph}>
                {product.description ||
                  'Crafted with high quality standards to bring wholesome wellness, energy, and joy to your companion. Engineered for pet safety, gentle care, and daily happiness.'}
              </p>

              {/* Only render highlights if real highlights exist */}
              {parsedHighlights.length > 0 && (
                <div className={styles.calloutGrid}>
                  {parsedHighlights.map((hl, idx) => (
                    <div key={idx} className={styles.calloutItem}>
                      <div className={styles.calloutIconWrap}>
                        <CheckCircle2 size={18} className={styles.calloutIcon} />
                      </div>
                      <div>
                        <h4 className={styles.calloutTitle}>{hl}</h4>
                        <p className={styles.calloutSub}>KickAt Quality Guarantee</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Clean Lifestyle Product Showcase */}
            <div className={styles.tabDetailsRightCol}>
              <div className={styles.lifestyleBannerWrap}>
                <SafeImage
                  src={(selectedVariant && selectedVariant.images && selectedVariant.images[0]) || product.image || product.images?.[0] || "/hero-products/dog_food.png"}
                  productName={product.name}
                  categoryName={product.mainCategory || undefined}
                  petSpecies={product.petSpecies || undefined}
                  alt={product.name || "Product lifestyle preview"}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className={styles.lifestyleImage}
                />
                <div className={styles.lifestyleBadgeBottom}>
                  <PawPrint size={15} fill="#F99205" color="#F99205" />
                  <span>KickAt Certified Quality</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ingredients':
        return (
          <div className={styles.tabContentBlock}>
            <div className={styles.tabContentHeader}>
              <h3 className={styles.tabSectionHeading}>Ingredients &amp; Nutritional Facts</h3>
              {product.dietaryPreference && (
                <span className={styles.dietaryTagBadge}>
                  <Leaf size={14} />
                  <span>{product.dietaryPreference === 'VEG' ? '100% Vegetarian' : 'Non-Vegetarian'}</span>
                </span>
              )}
            </div>

            {ingredientsText ? (
              <div className={styles.ingredientsCard}>
                <p className={styles.ingredientsBodyText}>{ingredientsText}</p>
              </div>
            ) : (
              <p className={styles.tabTextContent}>
                Crafted using wholesome ingredients carefully chosen to deliver balanced nutrition and great taste. Free from synthetic colorants or unnecessary fillers.
              </p>
            )}

            <div className={styles.nutritionHighlightsGrid}>
              <div className={styles.nutritionBox}>
                <span className={styles.nutritionBoxTitle}>Zero Fillers</span>
                <span className={styles.nutritionBoxSub}>No artificial additives</span>
              </div>
              <div className={styles.nutritionBox}>
                <span className={styles.nutritionBoxTitle}>Gentle on Stomach</span>
                <span className={styles.nutritionBoxSub}>Easy digestion formulation</span>
              </div>
              <div className={styles.nutritionBox}>
                <span className={styles.nutritionBoxTitle}>Rich in Nutrients</span>
                <span className={styles.nutritionBoxSub}>Vitamins &amp; minerals fortified</span>
              </div>
            </div>
          </div>
        );

      case 'feeding':
        return (
          <div className={styles.tabContentBlock}>
            <h3 className={styles.tabSectionHeading}>Feeding &amp; Usage Recommendations</h3>
            <div className={styles.feedingGuideCard}>
              <p className={styles.tabMainParagraph}>{feedingText}</p>
            </div>
            <div className={styles.feedingTipBox}>
              <PawPrint size={16} color="#F99205" />
              <span>
                Always ensure clean, fresh drinking water is accessible to your pet throughout the day.
              </span>
            </div>
          </div>
        );

      case 'materials':
        return (
          <div className={styles.tabContentBlock}>
            <h3 className={styles.tabSectionHeading}>Pet-Safe Materials &amp; Standards</h3>
            <p className={styles.tabTextContent}>
              {product.materials ||
                '100% pet-safe, non-toxic, and hypoallergenic materials. Rigorously tested to withstand daily wear while protecting your companion’s skin, paws, and health.'}
            </p>
            <div className={styles.safetyBadgesRow}>
              <div className={styles.safetyPill}>
                <CheckCircle2 size={15} color="#2E7D32" />
                <span>BPA &amp; Phthalate Free</span>
              </div>
              <div className={styles.safetyPill}>
                <CheckCircle2 size={15} color="#2E7D32" />
                <span>Non-Toxic Compounds</span>
              </div>
              <div className={styles.safetyPill}>
                <CheckCircle2 size={15} color="#2E7D32" />
                <span>Lab Quality Tested</span>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className={styles.tabContentBlock}>
            <h3 className={styles.tabSectionHeading}>Shipping &amp; Return Policy</h3>
            <div className={styles.shippingGrid}>
              <div className={styles.shippingCard}>
                <div className={styles.shippingIconWrap}>
                  <Truck size={22} color="#F99205" />
                </div>
                <div>
                  <h4 className={styles.shippingCardTitle}>Fast Express Delivery</h4>
                  <p className={styles.shippingCardDesc}>
                    Dispatched within 24 hours. Standard delivery takes 2–4 business days across India.
                  </p>
                </div>
              </div>

              <div className={styles.shippingCard}>
                <div className={styles.shippingIconWrap}>
                  <RotateCcw size={22} color="#F99205" />
                </div>
                <div>
                  <h4 className={styles.shippingCardTitle}>7-Day Easy Returns</h4>
                  <p className={styles.shippingCardDesc}>
                    Hassle-free replacement or full refund within 7 days of delivery for eligible items.
                  </p>
                </div>
              </div>

              <div className={styles.shippingCard}>
                <div className={styles.shippingIconWrap}>
                  <PackageCheck size={22} color="#F99205" />
                </div>
                <div>
                  <h4 className={styles.shippingCardTitle}>Tamper-Proof Packaging</h4>
                  <p className={styles.shippingCardDesc}>
                    {((selectedVariant?.shippingWeightKg ?? product.shippingWeightKg) && (selectedVariant?.shippingLengthCm ?? product.shippingLengthCm))
                      ? `Package Specs: ${selectedVariant?.shippingWeightKg ?? product.shippingWeightKg} kg (${selectedVariant?.shippingLengthCm ?? product.shippingLengthCm} cm L × ${selectedVariant?.shippingBreadthCm ?? product.shippingBreadthCm} cm B × ${selectedVariant?.shippingHeightCm ?? product.shippingHeightCm} cm H). Securely boxed for courier transit.`
                      : "Secure, sealed packaging ensures your products arrive fresh, clean, and undamaged."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.tabsSectionContainer}>
      {/* Horizontal Tabs Header Bar with Mobile Scroll Wrapper, Edge Fade & Tap Arrows */}
      <div className={styles.tabsHeaderNavWrap}>
        {/* Left Fade Indicator & Tap Arrow */}
        <div
          className={styles.tabsFadeLeft}
          style={{ opacity: showLeftArrow ? 1 : 0, pointerEvents: showLeftArrow ? 'auto' : 'none' }}
          aria-hidden="true"
        >
          <button
            type="button"
            className={styles.tabScrollArrow}
            onClick={handlePrevTab}
            aria-label="Previous tab"
            tabIndex={showLeftArrow ? 0 : -1}
          >
            <ChevronLeft size={14} />
          </button>
        </div>

        <div className={styles.tabsHeaderNav} ref={tabsNavRef}>
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabNavBtn} ${isActive ? styles.tabNavBtnActive : ''}`}
                onClick={(e) => handleTabClick(tab.id, e)}
                aria-selected={isActive}
                role="tab"
              >
                <span className={styles.tabBtnIcon}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Fade Indicator & Tap Arrow */}
        <div
          className={styles.tabsFadeRight}
          style={{ opacity: showRightArrow ? 1 : 0, pointerEvents: showRightArrow ? 'auto' : 'none' }}
          aria-hidden="true"
        >
          <button
            type="button"
            className={styles.tabScrollArrow}
            onClick={handleNextTab}
            aria-label="Next tab"
            tabIndex={showRightArrow ? 0 : -1}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Mobile Tab Sequence Progress Dots Indicator */}
      <div className={styles.tabProgressDots} aria-hidden="true">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabProgressDot} ${isActive ? styles.tabProgressDotActive : ''}`}
              onClick={() => goToTabByIndex(idx)}
              aria-label={`Switch to ${tab.label} tab`}
            />
          );
        })}
      </div>

      {/* Tab Panel Body */}
      <div className={styles.tabPanelBody} role="tabpanel">
        {renderTabContent(activeTab)}
      </div>
    </div>
  );
}
