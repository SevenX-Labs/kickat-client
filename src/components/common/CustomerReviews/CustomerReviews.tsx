"use client";

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import styles from './CustomerReviews.module.css';
import { testimonialService, TestimonialItem } from '@/services/testimonialService';

const AVATAR_COLORS = ["#333F2B", "#E7A03B", "#8B6F4E", "#5B7553", "#A0522D", "#2E5B88", "#7C3AED"];

interface DisplayReview {
  author: string;
  pet: string;
  initial: string;
  avatarColor: string;
  content: string;
  rating: number;
}

function ReviewCard({ review }: { review: DisplayReview }) {
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
            style={{ backgroundColor: review.avatarColor || '#333F2B' }}
          >
            {review.initial}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{review.author}</span>
            <span className={styles.authorPet}>{review.pet}</span>
          </div>
        </div>
        <div className={styles.ratingBadge}>
          <Star className={styles.starIcon} strokeWidth={1.5} fill="#E7A03B" color="#E7A03B" />
          <span className={styles.ratingValue}>{Number(review.rating || 5).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function CustomerReviews() {
  const [reviewsList, setReviewsList] = useState<DisplayReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const res = await testimonialService.getTestimonials(8);
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: DisplayReview[] = res.data.map((item: TestimonialItem, idx: number) => ({
            author: item.name,
            pet: item.petName ? `${item.petName} · ${item.petSpecies || 'Pet'}` : (item.petSpecies || item.location || 'Verified Buyer'),
            initial: (item.name || 'P').charAt(0).toUpperCase(),
            avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            content: item.comment,
            rating: item.rating || 5.0,
          }));
          setReviewsList(mapped);
        } else if (isMounted) {
          setReviewsList([]);
        }
      } catch (err) {
        console.warn('Failed to load testimonials:', err);
        if (isMounted) {
          setReviewsList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || reviewsList.length === 0) {
    return null;
  }

  const averageRating = (
    reviewsList.reduce((acc, r) => acc + (r.rating || 5.0), 0) / reviewsList.length
  ).toFixed(1);

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
          {reviewsList.map((review, idx) => (
            <ReviewCard key={`rev-a-${idx}`} review={review} />
          ))}
          {reviewsList.map((review, idx) => (
            <ReviewCard key={`rev-b-${idx}`} review={review} />
          ))}
        </div>
      </div>

      {/* Aggregate trust strip */}
      <div className={styles.container}>
        <div className={styles.trustStrip}>
          <div className={styles.trustRating}>
            <Star className={styles.trustStar} strokeWidth={1.5} fill="#E7A03B" color="#E7A03B" />
            <span className={styles.trustScore}>{averageRating}</span>
            <span className={styles.trustLabel}>
              average from {reviewsList.length} verified {reviewsList.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
