"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  Utensils,
  BookOpen,
  ClipboardList,
  Leaf,
  PawPrint,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './ProductDetail.module.css';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { Product, ProductVariant } from './ProductDetail';

interface ProductTabsProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
}

function parseMaterialsContent(raw?: string | null): { leadText: string; bullets: string[] } {
  if (!raw || !raw.trim()) return { leadText: "", bullets: [] };
  const str = raw.trim();

  const lines = str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bulletRegex = /^[-*•–—]\s+|\d+[\.\)]\s+/;

  if (lines.length > 1) {
    const leadLines: string[] = [];
    const bullets: string[] = [];
    let bulletStarted = false;

    for (const line of lines) {
      if (bulletRegex.test(line)) {
        bulletStarted = true;
        bullets.push(line.replace(bulletRegex, "").trim());
      } else if (bulletStarted) {
        bullets.push(line);
      } else {
        leadLines.push(line);
      }
    }
    return { leadText: leadLines.join("\n\n"), bullets };
  }

  // Single line starting with bullet marker
  if (/^[-*•–—]\s+/.test(str)) {
    const parts = str.split(/(?:^|\s+)[-*•–—]\s+/).map((p) => p.trim()).filter(Boolean);
    return { leadText: "", bullets: parts };
  }

  // Single line containing inline bullet markers like " - " or " • "
  if (/\s+[-*•–—]\s+/.test(str)) {
    const firstBulletIdx = str.search(/\s+[-*•–—]\s+/);
    const lead = str.substring(0, firstBulletIdx).trim();
    const rest = str.substring(firstBulletIdx).trim();
    const parts = rest.split(/(?:^|\s+)[-*•–—]\s+/).map((p) => p.trim()).filter(Boolean);
    return { leadText: lead, bullets: parts };
  }

  return { leadText: str, bullets: [] };
}

export function ProductTabs({ product, selectedVariant }: ProductTabsProps) {
  const { manufacturing } = usePublicSettings();
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

  if (product.materials || (product.attributes?.safetyBadges && Array.isArray(product.attributes.safetyBadges) && product.attributes.safetyBadges.length > 0)) {
    tabs.push({ id: 'materials', label: 'Materials & Safety', icon: <ShieldCheck size={15} /> });
  }

  tabs.push({ id: 'specifications', label: 'Product Specifications', icon: <ClipboardList size={15} /> });
  if (manufacturing && (manufacturing.manufacturerName || manufacturing.marketedBy || manufacturing.manufacturerAddress)) {
    tabs.push({ id: 'manufacturing', label: 'Manufacturing & Compliance', icon: <Building2 size={15} /> });
  }

  // Parse materials content & safety badges
  const parsedMaterials = parseMaterialsContent(product.materials);

  const rawSafetyBadges = product.attributes?.safetyBadges;
  let safetyBadges: string[] = [];
  if (Array.isArray(rawSafetyBadges) && rawSafetyBadges.length > 0) {
    safetyBadges = rawSafetyBadges
      .map((b: any) => (typeof b === "string" ? b.trim() : ""))
      .filter(Boolean);
  } else if (product.materials) {
    const lower = product.materials.toLowerCase();
    const detected: string[] = [];
    if (lower.includes("bpa") || lower.includes("phthalate")) {
      detected.push("BPA & Phthalate Free");
    }
    if (lower.includes("non-toxic") || lower.includes("nontoxic") || lower.includes("non toxic")) {
      detected.push("Non-Toxic Compounds");
    }
    if (lower.includes("lab quality") || lower.includes("tested") || lower.includes("lab tested")) {
      detected.push("Lab Quality Tested");
    }
    if (lower.includes("food-grade") || lower.includes("food grade")) {
      detected.push("100% Food-Grade");
    }
    if (lower.includes("hypoallergenic")) {
      detected.push("Hypoallergenic");
    }
    safetyBadges = detected;
  }

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


  // Build deduplicated specifications list
  const hasSelectedVariant = Boolean(selectedVariant);
  const activeWeightKg = hasSelectedVariant
    ? (typeof selectedVariant?.shippingWeightKg === "number" && selectedVariant.shippingWeightKg > 0 ? selectedVariant.shippingWeightKg : null)
    : (typeof product.shippingWeightKg === "number" && product.shippingWeightKg > 0 ? product.shippingWeightKg : null);

  const activeLengthCm = hasSelectedVariant
    ? (typeof selectedVariant?.shippingLengthCm === "number" && selectedVariant.shippingLengthCm > 0 ? selectedVariant.shippingLengthCm : null)
    : (typeof product.shippingLengthCm === "number" && product.shippingLengthCm > 0 ? product.shippingLengthCm : null);

  const activeBreadthCm = hasSelectedVariant
    ? (typeof selectedVariant?.shippingBreadthCm === "number" && selectedVariant.shippingBreadthCm > 0 ? selectedVariant.shippingBreadthCm : null)
    : (typeof product.shippingBreadthCm === "number" && product.shippingBreadthCm > 0 ? product.shippingBreadthCm : null);

  const activeHeightCm = hasSelectedVariant
    ? (typeof selectedVariant?.shippingHeightCm === "number" && selectedVariant.shippingHeightCm > 0 ? selectedVariant.shippingHeightCm : null)
    : (typeof product.shippingHeightCm === "number" && product.shippingHeightCm > 0 ? product.shippingHeightCm : null);

  const specsListRaw: { label: string; value: string }[] = [];

  specsListRaw.push({ label: "Brand", value: product.brand || "KickAt" });
  specsListRaw.push({ label: "Category", value: product.mainCategory || "Pet Essentials" });

  if (product.petSpecies) {
    specsListRaw.push({
      label: "Suitable For",
      value: `${product.petSpecies.charAt(0).toUpperCase()}${product.petSpecies.slice(1).toLowerCase()}s`,
    });
  }

  if (product.dietaryPreference) {
    specsListRaw.push({
      label: "Dietary Type",
      value: product.dietaryPreference === "VEG" ? "Vegetarian" : "Non-Vegetarian",
    });
  }

  if (selectedVariant?.name) {
    specsListRaw.push({ label: "Selected Variety", value: selectedVariant.name });
  }

  // Weight: Prefer net product weight if specified, otherwise shipping weight
  const netWeight = product.attributes?.weight ? String(product.attributes.weight).trim() : null;
  if (netWeight) {
    specsListRaw.push({ label: "Weight", value: netWeight });
  } else if (activeWeightKg) {
    specsListRaw.push({ label: "Weight", value: `${activeWeightKg} kg` });
  }

  // Dimensions: Single clean combined line
  if (activeLengthCm && activeBreadthCm && activeHeightCm) {
    specsListRaw.push({
      label: "Package Dimensions",
      value: `${activeLengthCm} × ${activeBreadthCm} × ${activeHeightCm} cm`,
    });
  } else if (product.attributes?.dimensions) {
    specsListRaw.push({
      label: "Dimensions",
      value: String(product.attributes.dimensions).trim(),
    });
  } else if (activeLengthCm || activeBreadthCm || activeHeightCm) {
    const parts = [
      activeLengthCm ? `L: ${activeLengthCm}cm` : null,
      activeBreadthCm ? `W: ${activeBreadthCm}cm` : null,
      activeHeightCm ? `H: ${activeHeightCm}cm` : null,
    ].filter(Boolean);
    specsListRaw.push({ label: "Dimensions", value: parts.join(" × ") });
  }

  // Country of Origin
  const originCountry =
    product.attributes?.countryOfOrigin ||
    manufacturing?.countryOfOrigin ||
    "India";
  specsListRaw.push({ label: "Country of Origin", value: String(originCountry).trim() });

  // Life stage
  if (product.attributes?.lifeStage) {
    specsListRaw.push({ label: "Life Stage", value: String(product.attributes.lifeStage).trim() });
  }

  // Custom Attributes (excluding keys already handled)
  if (product.attributes && typeof product.attributes === "object") {
    const excludedKeys = new Set([
      "ingredients",
      "feedingguide",
      "description",
      "highlights",
      "images",
      "media",
      "careinstructions",
      "sizeguide",
      "faqs",
      "safetybadges",
      "weight",
      "dimensions",
      "countryoforigin",
      "lifestage",
    ]);

    Object.entries(product.attributes).forEach(([key, val]) => {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!excludedKeys.has(lowerKey) && (typeof val === "string" || typeof val === "number")) {
        const strVal = String(val).trim();
        if (strVal.length > 0 && strVal.length < 60 && !strVal.toLowerCase().includes("ingredients") && !strVal.toLowerCase().includes("storage:")) {
          const formattedLabel = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
          specsListRaw.push({ label: formattedLabel, value: strVal });
        }
      }
    });
  }

  if (manufacturing?.manufacturerName) {
    specsListRaw.push({ label: "Manufacturer", value: manufacturing.manufacturerName });
  }
  if (manufacturing?.shelfLife) {
    specsListRaw.push({ label: "Shelf Life", value: manufacturing.shelfLife });
  }

  // Deduplicate by normalized label
  const seenLabels = new Set<string>();
  const specsList = specsListRaw.filter((item) => {
    const norm = item.label.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seenLabels.has(norm)) return false;
    seenLabels.add(norm);
    return true;
  });

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

            {parsedMaterials.leadText && (
              <p className={styles.tabTextContent}>{parsedMaterials.leadText}</p>
            )}

            {parsedMaterials.bullets.length > 0 && (
              <ul className={styles.materialsBulletList}>
                {parsedMaterials.bullets.map((bullet, idx) => (
                  <li key={idx} className={styles.materialsBulletItem}>
                    <span className={styles.materialsBulletIcon}>
                      <CheckCircle2 size={16} />
                    </span>
                    <span className={styles.materialsBulletText}>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {!parsedMaterials.leadText && parsedMaterials.bullets.length === 0 && (
              <p className={styles.tabTextContent}>
                100% pet-safe, non-toxic, and hypoallergenic materials. Rigorously tested to withstand daily wear while protecting your companion’s skin, paws, and health.
              </p>
            )}

            {safetyBadges.length > 0 && (
              <div className={styles.safetyBadgesRow}>
                {safetyBadges.map((badge, idx) => (
                  <div key={idx} className={styles.safetyPill}>
                    <CheckCircle2 size={15} color="#2E7D32" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'manufacturing':
        if (!manufacturing || (!manufacturing.manufacturerName && !manufacturing.marketedBy && !manufacturing.manufacturerAddress)) {
          return null;
        }
        return (
          <div className={styles.tabContentBlock}>
            <h3 className={styles.tabSectionHeading}>Manufacturing &amp; Regulatory Compliance</h3>
            <p className={styles.tabTextContent}>
              Mandatory legal disclosures under the Legal Metrology (Packaged Commodities) Rules, 2011 for e-commerce products in India.
            </p>

            <div className={styles.shippingGrid} style={{ marginTop: '1.25rem' }}>
              {(manufacturing.manufacturerName || manufacturing.marketedBy || manufacturing.manufacturerAddress) && (
                <div className={styles.shippingCard}>
                  <div className={styles.shippingIconWrap}>
                    <Building2 size={22} color="#F99205" />
                  </div>
                  <div>
                    <h4 className={styles.shippingCardTitle}>
                      {manufacturing.marketedBy ? 'Manufactured & Marketed By' : 'Manufacturer Details'}
                    </h4>
                    <p className={styles.shippingCardDesc} style={{ lineHeight: 1.6 }}>
                      {manufacturing.marketedBy && (
                        <>
                          <strong>Marketed By:</strong> {manufacturing.marketedBy}<br />
                        </>
                      )}
                      {manufacturing.manufacturerName && (
                        <>
                          <strong>Manufactured By:</strong> {manufacturing.manufacturerName}<br />
                        </>
                      )}
                      {manufacturing.manufacturerAddress && (
                        <>
                          {manufacturing.manufacturerAddress}<br />
                        </>
                      )}
                      {manufacturing.cinNumber && (
                        <>
                          <strong>CIN:</strong> {manufacturing.cinNumber}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.shippingCard}>
                <div className={styles.shippingIconWrap}>
                  <ShieldCheck size={22} color="#2E7D32" />
                </div>
                <div>
                  <h4 className={styles.shippingCardTitle}>Quality &amp; Safety Standard</h4>
                  <p className={styles.shippingCardDesc} style={{ lineHeight: 1.6 }}>
                    {manufacturing.qualityStandard || '100% Quality Inspected & Batch Verified.'}<br />
                    <strong>Country of Origin:</strong> {manufacturing.countryOfOrigin || 'India'}
                  </p>
                </div>
              </div>

              {(manufacturing.consumerCareEmail || manufacturing.consumerCarePhone || manufacturing.shelfLife) && (
                <div className={styles.shippingCard}>
                  <div className={styles.shippingIconWrap}>
                    <Leaf size={22} color="#F99205" />
                  </div>
                  <div>
                    <h4 className={styles.shippingCardTitle}>Consumer Care &amp; Support</h4>
                    <p className={styles.shippingCardDesc} style={{ lineHeight: 1.6 }}>
                      For queries, feedback, or consumer complaints:<br />
                      {manufacturing.consumerCareEmail && (
                        <>
                          <strong>Email:</strong> {manufacturing.consumerCareEmail}<br />
                        </>
                      )}
                      {manufacturing.consumerCarePhone && (
                        <>
                          <strong>Helpline:</strong> {manufacturing.consumerCarePhone}<br />
                        </>
                      )}
                      {manufacturing.shelfLife && (
                        <>
                          <strong>Shelf Life:</strong> {manufacturing.shelfLife}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'specifications':
        return (
          <div className={styles.tabContentBlock}>
            <div className={styles.tabContentHeader}>
              <div>
                <h3 className={styles.tabSectionHeading} style={{ margin: 0 }}>Product Specifications</h3>
                <p className={styles.tabTextContent} style={{ margin: '0.25rem 0 0 0' }}>
                  Detailed specifications, sizing, weight, and origin details.
                </p>
              </div>
              <span className={styles.specsVerifiedBadge}>
                <ShieldCheck size={14} color="#2E7D32" />
                <span>100% Genuine Verified</span>
              </span>
            </div>

            <div className={styles.specsTabCard}>
              <div className={styles.specsTabGrid}>
                {specsList.map((item, idx) => (
                  <div key={idx} className={styles.specsTableRow}>
                    <span className={styles.specsLabel}>{item.label}</span>
                    <span className={styles.specsValue}>{item.value}</span>
                  </div>
                ))}
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
