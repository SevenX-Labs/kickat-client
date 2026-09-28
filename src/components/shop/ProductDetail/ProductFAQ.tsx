"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./ProductDetail.module.css";

export interface ProductFAQItem {
  question: string;
  answer: string;
}

interface ProductFAQProps {
  faqs?: ProductFAQItem[];
}

const DEFAULT_FAQS: ProductFAQItem[] = [
  {
    question: "Is this product safe and non-toxic for pets?",
    answer: "Absolutely. All KickAt products are crafted with premium pet-safe materials, non-toxic, and tested thoroughly to ensure complete safety and comfort for your pet."
  },
  {
    question: "How do I clean and care for this product?",
    answer: "Simply follow the care instructions listed on this page. Most items can be easily cleaned with mild pet-safe soap and warm water or air-dried."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 7-day hassle-free return and replacement policy for eligible items. If there is any sizing or quality issue, contact our support team anytime."
  },
  {
    question: "When can I expect delivery?",
    answer: "Standard delivery typically takes 2-5 business days depending on your location across India. Express shipping is also available during checkout."
  }
];

export function ProductFAQ({ faqs }: ProductFAQProps) {
  const displayFaqs = (faqs && Array.isArray(faqs) && faqs.length > 0) ? faqs : DEFAULT_FAQS;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqMainWrapper}>
      <h2 className={styles.faqSectionHeaderTitle}>Frequently Asked Questions</h2>

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
    </div>
  );
}
