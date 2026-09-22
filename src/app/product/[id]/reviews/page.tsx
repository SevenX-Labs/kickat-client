"use client";

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Edit3, CheckCircle2, ThumbsUp, Loader2 } from 'lucide-react';
import styles from './Reviews.module.css';
import { reviewService } from '@/services/reviewService';
import { ReviewItem, ReviewSummaryData } from '@/types/review';
import { WriteReviewModal } from '@/components/shop/ProductDetail/WriteReviewModal';

export default function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [helpfulCountMap, setHelpfulCountMap] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const [sumRes, revRes] = await Promise.allSettled([
        reviewService.getReviewSummary(productId),
        reviewService.getReviews({ productId, limit: 50, sort: 'newest' }),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.summary) {
        setSummary(sumRes.value.summary);
      }
      if (revRes.status === 'fulfilled' && revRes.value?.reviews) {
        setReviews(revRes.value.reviews);
      }
    } catch (err) {
      console.warn('Could not load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleHelpful = async (revId: string) => {
    try {
      const res = await reviewService.markHelpful(revId);
      if (res && res.success) {
        setHelpfulVotes((prev) => ({
          ...prev,
          [revId]: res.isHelpful ?? !prev[revId],
        }));
        setHelpfulCountMap((prev) => ({
          ...prev,
          [revId]: res.helpfulCount,
        }));
        setToast(res.message || 'Updated vote');
        setTimeout(() => setToast(null), 2500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const avgRating = summary?.averageRating ? summary.averageRating.toFixed(1) : '0.0';
  const totalReviews = summary?.totalReviews ?? reviews.length;
  const dist = summary?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalInDist = Object.values(dist).reduce((acc, v) => acc + v, 0);

  const bars = [5, 4, 3, 2, 1].map((s) => {
    const count = dist[s] || 0;
    const percent = totalInDist > 0 ? `${Math.round((count / totalInDist) * 100)}%` : '0%';
    return { stars: s, percent, count };
  });

  const dummyProduct = {
    id: productId,
    name: 'Product',
    price: 0,
    rating: Number(avgRating),
    image: '',
    images: [],
    mainCategory: '',
    subCategory: '',
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href={`/product/${productId}`} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.title}>Customer Reviews</h1>
        </div>

        {toast && (
          <div style={{ background: '#FEF3C7', color: '#92400E', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
            {toast}
          </div>
        )}

        <div className={styles.dashboard}>
          <div className={styles.aggregateScore}>
            <div className={styles.bigScore}>{avgRating}</div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={24}
                  fill={s <= Math.round(Number(avgRating)) ? "#F99205" : "none"}
                  color={s <= Math.round(Number(avgRating)) ? "#F99205" : "#ccc"}
                />
              ))}
            </div>
            <div className={styles.totalReviews}>Based on {totalReviews} reviews</div>
          </div>
          
          <div className={styles.bars}>
            {bars.map((row) => (
              <div key={row.stars} className={styles.barRow}>
                <span className={styles.starLabel}>
                  {row.stars} <Star size={12} fill="#F99205" color="#F99205" />
                </span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: row.percent }} />
                </div>
                <span className={styles.barCount}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.listHeader}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Showing {reviews.length} reviews</h2>
            <button className={styles.writeBtn} onClick={() => setIsModalOpen(true)}>
              <Edit3 size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Write a Review
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0', color: '#666' }}>
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
              No reviews submitted for this product yet.
            </div>
          ) : (
            <div style={{ background: '#fafafa', borderRadius: '16px', padding: '1.5rem', border: '1px solid #eaeaea' }}>
              {reviews.map((review) => {
                const count = helpfulCountMap[review.id] ?? review.helpfulCount;
                const isVoted = !!helpfulVotes[review.id];
                return (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <div className={styles.reviewerName}>
                          {review.userName}
                          {review.isVerifiedPurchase && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.15rem', marginTop: '0.25rem' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= review.rating ? "#F99205" : "none"}
                              color={s <= review.rating ? "#F99205" : "#ccc"}
                            />
                          ))}
                        </div>
                      </div>
                      <div className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {review.title && <h3 className={styles.reviewTitle}>{review.title}</h3>}
                    <p className={styles.reviewText}>{review.comment}</p>
                    <button
                      type="button"
                      onClick={() => toggleHelpful(review.id)}
                      style={{
                        marginTop: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: isVoted ? '#FEF3C7' : '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <ThumbsUp size={12} color={isVoted ? '#D97706' : '#6b7280'} />
                      <span>Helpful ({count})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WriteReviewModal
        product={dummyProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => loadData()}
      />
    </main>
  );
}
