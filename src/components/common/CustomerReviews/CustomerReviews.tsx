"use client";

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { testimonialService, TestimonialItem } from '@/services/testimonialService';
import styles from './CustomerReviews.module.css';

interface ReviewDisplayItem {
  id?: string;
  author: string;
  pet: string;
  initial: string;
  avatarColor: string;
  content: string;
  rating: number;
}

const AVATAR_COLORS = ["#333F2B", "#E7A03B", "#8B6F4E", "#5B7553", "#A0522D", "#2C4A6F", "#B45309"];

function ReviewCard({ review }: { review: ReviewDisplayItem }) {
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
            {review.pet && <span className={styles.authorPet}>{review.pet}</span>}
          </div>
        </div>
        <div className={styles.ratingBadge}>
          <Star className={styles.starIcon} strokeWidth={1.5} fill="#E7A03B" />
          <span className={styles.ratingValue}>{review.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function CustomerReviews() {
  const [reviewsList, setReviewsList] = useState<ReviewDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const data = await testimonialService.getTestimonials(10);
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const mapped: ReviewDisplayItem[] = data.map((t: any, idx) => {
            const petSpecies = t.petType || t.petSpecies || '';
            const petInfo = [t.petName, petSpecies].filter(Boolean).join(' · ') || t.role || t.location || '';
            const author = t.name || t.authorName || 'Pet Parent';
            const initial = author.trim().charAt(0).toUpperCase();
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return {
              id: t.id,
              author,
              pet: petInfo,
              initial,
              avatarColor,
              content: t.content || t.comment || '',
              rating: Number(t.rating) || 5.0,
            };
          });
          setReviewsList(mapped);
        }
      } catch (err) {
        console.warn('Could not load testimonials feed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
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
    reviewsList.reduce((acc, r) => acc + r.rating, 0) / (reviewsList.length || 1)
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
          {/* First set */}
          {reviewsList.map((review, idx) => (
            <ReviewCard key={`a-${review.id || idx}`} review={review} />
          ))}
          {/* Duplicate set for seamless loop */}
          {reviewsList.map((review, idx) => (
            <ReviewCard key={`b-${review.id || idx}`} review={review} />
          ))}
        </div>
      </div>

      {/* Aggregate trust strip */}
      <div className={styles.container}>
        <div className={styles.trustStrip}>
          <div className={styles.trustRating}>
            <Star className={styles.trustStar} strokeWidth={1.5} fill="#E7A03B" color="#E7A03B" />
            <span className={styles.trustScore}>{averageRating}</span>
            <span className={styles.trustLabel}>average from 12,300+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
