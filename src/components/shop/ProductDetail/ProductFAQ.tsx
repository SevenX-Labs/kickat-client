"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import styles from "./ProductDetail.module.css";

export interface ProductFAQItem {
  question: string;
  answer: string;
}

interface ProductFAQProps {
  faqs?: Array<{ question: string; answer: string }> | string | null;
  careInstructions?: string[] | null;
}

const DEFAULT_FAQS: ProductFAQItem[] = [
  {
    question: "Is this product safe and genuine for my pet?",
    answer: "Yes, 100%. Every item on KickAt is guaranteed authentic, quality-inspected, and crafted with pet-safe materials to ensure complete safety and comfort for your furry friend."
  },
  {
    question: "How long does shipping and delivery take?",
    answer: "Orders are dispatched within 24 hours. Standard delivery typically takes 2–5 business days depending on your location across India. Real-time tracking is provided for every order."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 7-day hassle-free return and replacement policy for eligible items. If there is any defect or damage during transit, reach out to our support team for quick assistance."
  },
  {
    question: "How do I clean and care for this product?",
    answer: "Follow the care instructions listed on this page. Most items can be easily cleaned with mild pet-safe soap and warm water or air-dried to maintain durability."
  }
];

export function ProductFAQ({ faqs, careInstructions }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Parse real FAQs safely from product
  let parsedFaqs: ProductFAQItem[] = [];
  if (faqs) {
    if (Array.isArray(faqs)) {
      parsedFaqs = faqs.filter(
        (f) => f && typeof f.question === "string" && f.question.trim().length > 0
      );
    } else if (typeof faqs === "string") {
      try {
        const decoded = JSON.parse(faqs);
        if (Array.isArray(decoded)) {
          parsedFaqs = decoded.filter(
            (f) => f && typeof f.question === "string" && f.question.trim().length > 0
          );
        }
      } catch {}
    }
  }

  const displayFaqs = parsedFaqs.length > 0 ? parsedFaqs : DEFAULT_FAQS;

  // Real care instructions from DB (only shown if entered)
  const careList = Array.isArray(careInstructions)
    ? careInstructions.filter((c) => typeof c === "string" && c.trim().length > 0)
    : [];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqMainWrapper}>
      <div className={styles.specsCardHeader} style={{ marginBottom: "1.25rem" }}>
        <div>
          <h2 className={styles.faqSectionHeaderTitle} style={{ margin: 0 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#78746D" }}>
            Answers about pet safety, delivery, returns, and care recommendations
          </p>
        </div>
        <span className={styles.specsVerifiedBadge}>
          <HelpCircle size={14} color="#2E7D32" />
          <span>Support &amp; FAQ</span>
        </span>
      </div>

      <div className={styles.faqAccordionContainer}>
        {displayFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`${styles.faqAccordionItem} ${isOpen ? styles.faqItemOpen : ""}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleAccordion(idx)}
              >
                <span className={styles.faqQuestionText}>{faq.question}</span>
                <ChevronDown
                  size={18}
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

      {/* Real Care Instructions from Admin (if available) */}
      {careList.length > 0 && (
        <div className={styles.careSection} style={{ marginTop: "1.75rem" }}>
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
  );
}
