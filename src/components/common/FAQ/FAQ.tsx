"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: "What is your shipping policy?",
    answer: "We offer free standard shipping on all orders over ₹999 within India. For orders under ₹999, a flat rate of ₹99 applies. Standard shipping typically takes 3-5 business days."
  },
  {
    question: "Can I return open pet food if my pet doesn't like it?",
    answer: "Yes! We have a 100% Satisfaction Guarantee. If your pet turns their nose up at a new food, you can return the open bag within 14 days for a full store credit to try something else."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you will receive an email with a tracking number. You can also view real-time tracking information by logging into your Account and visiting the Orders page."
  },
  {
    question: "Are your grooming products safe for sensitive skin?",
    answer: "Absolutely. All KickAt grooming products are formulated with natural, hypoallergenic ingredients specifically designed to be gentle on sensitive pet skin. We never use harsh chemicals or artificial parabens."
  },
  {
    question: "Do you offer subscription discounts?",
    answer: "Yes! When you subscribe to regular deliveries for food or treats, you save 15% on every order. You can easily skip, pause, or cancel your subscription at any time from your account dashboard."
  }
];

export function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Got Questions?</span>
          <h2 className={styles.title}>
            Frequently Asked <em className={styles.titleAccent}>Questions</em>
          </h2>
        </div>

        <div className={styles.accordion}>
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            return (
              <div 
                key={index} 
                className={`${styles.faqItem} ${isActive ? styles.active : ''}`}
              >
                <button 
                  className={styles.questionBtn} 
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isActive}
                >
                  {faq.question}
                  <div className={styles.iconWrapper}>
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                </button>
                <div className={styles.answerWrapper}>
                  <div className={styles.answerInner}>
                    <div className={styles.answer}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
