"use client";

import { useState } from "react";
import { ShieldCheck, ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import styles from "./ProductDetail.module.css";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { Product, ProductVariant } from "./ProductDetail";

export interface ProductFAQItem {
  question: string;
  answer: string;
}

const DEFAULT_PRODUCT_FAQS: ProductFAQItem[] = [
  {
    question: "Is this product genuine and safe for my pet?",
    answer: "Yes, 100%. Every item on KickAt is guaranteed authentic, quality-checked, and crafted with pet-safe standards to ensure complete safety and comfort.",
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery typically takes 2–5 business days depending on your location across India. Express courier tracking is provided with every order.",
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 7-day hassle-free return and replacement policy for eligible items. If there is any defect or quality issue, contact our support team anytime.",
  },
  {
    question: "How should I clean and maintain this item?",
    answer: "Follow the care recommendations for best longevity. Keep in a clean, dry area and wipe or wash with gentle, pet-safe water or soap as needed.",
  },
];

interface SpecsAndSizeGuideProps {
  product?: Product;
  selectedVariant?: ProductVariant | null;
  productDetails?: Record<string, string>;
}

export function ProductSpecsAndSizeGuide({ product, selectedVariant, productDetails }: SpecsAndSizeGuideProps) {
  const { manufacturing } = usePublicSettings();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Parse real FAQs from product
  let parsedFaqs: ProductFAQItem[] = [];
  if (product?.faqs) {
    if (Array.isArray(product.faqs)) {
      parsedFaqs = product.faqs.filter(
        (f) => f && typeof f.question === "string" && f.question.trim().length > 0
      );
    } else if (typeof product.faqs === "string") {
      try {
        const decoded = JSON.parse(product.faqs);
        if (Array.isArray(decoded)) {
          parsedFaqs = decoded.filter(
            (f) => f && typeof f.question === "string" && f.question.trim().length > 0
          );
        }
      } catch {}
    }
  }

  const displayFaqs = parsedFaqs.length > 0 ? parsedFaqs : DEFAULT_PRODUCT_FAQS;

  // Real care instructions from DB (only shown if genuine care instructions exist)
  const careList = Array.isArray(product?.careInstructions)
    ? product.careInstructions.filter((c) => typeof c === "string" && c.trim().length > 0)
    : [];

  let specsList: { label: string; value: string }[] = [];

  if (productDetails) {
    specsList = Object.entries(productDetails).map(([label, value]) => ({ label, value }));
  } else if (product) {
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

    // Weight: Prefer net product weight if specified, otherwise shipping weight (single clean line)
    const netWeight = product.attributes?.weight ? String(product.attributes.weight).trim() : null;
    if (netWeight) {
      specsListRaw.push({ label: "Weight", value: netWeight });
    } else if (activeWeightKg) {
      specsListRaw.push({ label: "Weight", value: `${activeWeightKg} kg` });
    }

    // Dimensions: Single clean combined line (eliminates repetitive length, breadth, height lines)
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

    // Country of Origin (single clean entry)
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

    // Strict deduplication by normalized label
    const seenLabels = new Set<string>();
    specsList = specsListRaw.filter((item) => {
      const norm = item.label.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seenLabels.has(norm)) return false;
      seenLabels.add(norm);
      return true;
    });
  } else {
    specsList = [
      { label: "Brand", value: "KickAt" },
      { label: "Material", value: "Pet-Safe Material" },
      { label: "Suitable For", value: "All Pets" },
      { label: "Country of Origin", value: "India" },
    ];
  }

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

      {/* Right Column: Frequently Asked Questions (Replaces Dummy Size Guide) */}
      <div className={styles.specsCard}>
        <div className={styles.specsCardHeader}>
          <h3 className={styles.specsCardTitle}>Frequently Asked Questions</h3>
          <span className={styles.specsVerifiedBadge}>
            <HelpCircle size={14} color="#2E7D32" />
            <span>Support &amp; FAQ</span>
          </span>
        </div>

        <div className={styles.faqAccordionContainer}>
          {displayFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`${styles.faqAccordionItem} ${isOpen ? styles.faqItemOpen : ""}`}
              >
                <button
                  type="button"
                  className={styles.faqQuestionBtn}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                >
                  <span className={styles.faqQuestionText}>{faq.question}</span>
                  <ChevronDown
                    size={17}
                    className={`${styles.faqChevron} ${isOpen ? styles.faqChevronRotate : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className={styles.faqAnswerContent}>
                    <p className={styles.faqAnswerText}>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real Care Instructions from Admin (only shown if entered) */}
        {careList.length > 0 && (
          <div className={styles.careSection}>
            <h4 className={styles.careTitle}>Storage &amp; Care Recommendations</h4>
            <div className={styles.careItemsRow}>
              {careList.map((instruction, idx) => (
                <div key={idx} className={styles.careItem}>
                  <Sparkles size={15} className={styles.careIcon} />
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
