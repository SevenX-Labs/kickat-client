"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './ProductDetail.module.css';

const FAQS = [
  {
    question: "Is this toy suitable for aggressive chewers?",
    answer: "Yes! Crafted from thick, natural food-grade rubber, it is engineered for heavy play and moderate to aggressive chewing routines while being gentle on teeth."
  },
  {
    question: "How do I clean and care for this product?",
    answer: "Simply rinse with warm water and mild soap after play, then let air dry. It is also top-rack dishwasher safe for hassle-free maintenance."
  },
  {
    question: "Is the material 100% safe and non-toxic?",
    answer: "Absolutely. All KickAt products are certified BPA-free, phthalate-free, and non-toxic, thoroughly tested for pet safety."
  },
  {
    question: "What if my pet doesn't like it or needs a different size?",
    answer: "We offer a 7-day hassle-free return and exchange policy. Simply contact customer support and we'll gladly arrange a replacement or refund."
  }
];

export function ProductFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqMainWrapper}>
      <h2 className={styles.faqSectionHeaderTitle}>Frequently Asked Questions</h2>

      <div className={styles.faqAccordionContainer}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`${styles.faqAccordionItem} ${isOpen ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestionBtn}
                onClick={() => toggleAccordion(idx)}
              >
                <span className={styles.faqQuestionText}>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`${styles.faqChevron} ${isOpen ? styles.faqChevronRotate : ''}`}
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
