"use client";

import { Star } from 'lucide-react';
import styles from './CustomerReviews.module.css';

const reviews = [
  {
    author: "Sarah Mitchell",
    pet: "Max · Golden Retriever",
    initial: "S",
    avatarColor: "#333F2B",
    content: "KickAt completely transformed Max's digestion. The quality of the food is unmatched and the delivery is always perfectly on time.",
    rating: 4.9,
  },
  {
    author: "Priya Sharma",
    pet: "Luna · Bengal Cat",
    initial: "P",
    avatarColor: "#E7A03B",
    content: "I've never seen Luna so excited for meal time. The treats are her absolute favorite, and I love that they are made with clean, honest ingredients.",
    rating: 5.0,
  },
  {
    author: "James Cooper",
    pet: "Charlie · French Bulldog",
    initial: "J",
    avatarColor: "#8B6F4E",
    content: "The toys are incredibly durable and beautifully designed. Finally, pet accessories that actually look good in my apartment!",
    rating: 4.8,
  },
  {
    author: "Ananya Desai",
    pet: "Coco · Labrador",
    initial: "A",
    avatarColor: "#5B7553",
    content: "We switched to KickAt six months ago and Coco's coat has never looked shinier. The subscription saves us so much time and money.",
    rating: 4.9,
  },
  {
    author: "Rohan Mehta",
    pet: "Simba · Persian Cat",
    initial: "R",
    avatarColor: "#A0522D",
    content: "Simba is the pickiest eater I've ever met, but he devours everything from KickAt. The grooming products are amazing too.",
    rating: 5.0,
  },
];

function ReviewCard({ review }: { review: typeof reviews[0] }) {
  return (
    <div className={styles.card}>
      <span className={styles.quoteDecor}>&ldquo;</span>
      <blockquote className={styles.quote}>
        {review.content}
      </blockquote>
      <div className={styles.cardFooter}>
        <div className={styles.authorRow}>
          <div
            className={styles.avatar}
            style={{ backgroundColor: review.avatarColor }}
          >
            {review.initial}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{review.author}</span>
            <span className={styles.authorPet}>{review.pet}</span>
          </div>
        </div>
        <div className={styles.ratingBadge}>
          <Star className={styles.starIcon} strokeWidth={1.5} />
          <span className={styles.ratingValue}>{review.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function CustomerReviews() {
  return (
    <section id="reviews" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>What pet parents say</span>
          <h2 className={styles.title}>
            Happy Pets.<br />
            <em className={styles.titleAccent}>Happier Humans.</em>
          </h2>
        </div>
      </div>

      {/* Infinite scrolling marquee */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          {/* First set */}
          {reviews.map((review, idx) => (
            <ReviewCard key={`a-${idx}`} review={review} />
          ))}
          {/* Duplicate set for seamless loop */}
          {reviews.map((review, idx) => (
            <ReviewCard key={`b-${idx}`} review={review} />
          ))}
        </div>
      </div>

      {/* Aggregate trust strip */}
      <div className={styles.container}>
        <div className={styles.trustStrip}>
          <div className={styles.trustRating}>
            <Star className={styles.trustStar} strokeWidth={1.5} fill="#E7A03B" color="#E7A03B" />
            <span className={styles.trustScore}>4.9</span>
            <span className={styles.trustLabel}>average from 12,300+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
