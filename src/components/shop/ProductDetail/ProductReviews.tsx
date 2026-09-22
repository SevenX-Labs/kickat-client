"use client";

import { useState, useEffect, useCallback } from 'react';
import { Star, Edit3, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import Image from 'next/image';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';
import { ReviewsDrawer } from './ReviewsDrawer';
import { WriteReviewModal } from './WriteReviewModal';
import { reviewService } from '@/services/reviewService';
import { ReviewSummaryData, ReviewItem } from '@/types/review';

interface ProductReviewsProps {
  product: Product;
}

const DEFAULT_PHOTOS = [
  '/hero-products/dog_food.png',
  '/hero-products/pet_toy.png',
  '/hero-products/pet_bowl.png',
  '/hero-products/cat_treats.png',
  '/hero-products/bird_seed.png',
];

export function ProductReviews({ product }: ProductReviewsProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<ReviewSummaryData | null>(null);
  const [liveReviews, setLiveReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSummaryAndReviews = useCallback(async () => {
    if (!product?.id) return;
    setIsLoading(true);
    try {
      const [sumRes, revRes] = await Promise.allSettled([
        reviewService.getReviewSummary(product.id),
        reviewService.getReviews({ productId: product.id, limit: 50, sort: 'newest' }),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.summary) {
        setSummary(sumRes.value.summary);
      }
      if (revRes.status === 'fulfilled' && revRes.value?.reviews) {
        setLiveReviews(revRes.value.reviews);
      }
    } catch (err) {
      console.warn('Could not load live reviews summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchSummaryAndReviews();
  }, [fetchSummaryAndReviews]);

  const rating = summary?.averageRating || product.rating || 4.8;
  const reviewsCount = summary?.totalReviews ?? product.reviewsCount ?? liveReviews.length ?? 0;

  // Build 5 -> 1 rating breakdown percentages dynamically
  const dist = summary?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalInDist = Object.values(dist).reduce((acc, val) => acc + val, 0);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = dist[stars] || 0;
    const percentage = totalInDist > 0 ? Math.round((count / totalInDist) * 100) : 0;
    return { stars, count, percentage };
  });

  // Extract photos attached to customer reviews or use defaults
  const customerPhotos = liveReviews.flatMap((r) => r.photos || []).filter(Boolean);
  const displayPhotos = customerPhotos.length > 0 ? customerPhotos.slice(0, 5) : DEFAULT_PHOTOS;
  const extraPhotoCount = customerPhotos.length > 5 ? customerPhotos.length - 5 : 12;

  const handleReviewSubmitted = () => {
    fetchSummaryAndReviews();
  };

  return (
    <div className={styles.reviewsMainWrapper} id="reviews">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className={styles.reviewsSectionHeaderTitle} style={{ margin: 0 }}>Customer Reviews</h2>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(249, 146, 5, 0.08)',
            color: '#F99205',
            border: '1px solid rgba(249, 146, 5, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageSquare size={15} />
          <span>See All {reviewsCount} Reviews</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Top Ratings Overview Row */}
      <div className={styles.reviewsOverviewCard}>
        {/* Left: Big Rating Score & Stars */}
        <div className={styles.ratingNumberBlock} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
          <span className={styles.bigRatingScore}>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          <div className={styles.ratingStarsCol}>
            <div className={styles.starsRowInline}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(Number(rating)) ? "#F99205" : "#E0DCD4"}
                  color={i < Math.round(Number(rating)) ? "#F99205" : "#E0DCD4"}
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className={styles.basedOnText} style={{ textDecoration: 'underline' }}>Based on {reviewsCount} reviews</span>
          </div>
        </div>

        {/* Center: Rating Progress Bars */}
        <div className={styles.ratingProgressBarsCol} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
          {ratingBreakdown.map((item) => (
            <div key={item.stars} className={styles.progressRow}>
              <span className={styles.starLabelNum}>{item.stars} ★</span>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className={styles.percentageVal}>{item.percentage}%</span>
            </div>
          ))}
        </div>

        {/* Right: Write a Review Button */}
        <div className={styles.writeReviewBtnCol}>
          <button
            type="button"
            className={styles.writeReviewBtn}
            onClick={() => setShowReviewModal(true)}
          >
            <Edit3 size={15} />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Customer Photos Row */}
      <div className={styles.customerPhotosSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className={styles.customerPhotosTitle}>Customer Photos</h3>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#F99205',
              fontWeight: '700',
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            See all reviews →
          </button>
        </div>

        <div className={styles.customerPhotosRow}>
          {displayPhotos.map((photo, idx) => (
            <div key={idx} className={styles.photoTileWrap} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
              <Image
                src={photo}
                alt={`Customer review photo ${idx + 1}`}
                fill
                sizes="120px"
                className={styles.customerPhotoImg}
                unoptimized={photo.startsWith('data:')}
              />
            </div>
          ))}

          {/* +More Tile */}
          <div 
            className={`${styles.photoTileWrap} ${styles.morePhotosTile}`} 
            onClick={() => setIsDrawerOpen(true)} 
            style={{ cursor: 'pointer' }}
          >
            <Image
              src={displayPhotos[0]}
              alt="More customer photos"
              fill
              sizes="120px"
              className={styles.customerPhotoImg}
              unoptimized={displayPhotos[0]?.startsWith('data:')}
            />
            <div className={styles.morePhotosOverlay}>
              <span className={styles.moreCountText}>+{extraPhotoCount}</span>
              <span className={styles.moreLabelText}>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Reviews Drawer */}
      <ReviewsDrawer 
        product={product}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onWriteReview={() => setShowReviewModal(true)}
      />

      {/* Write Review Modal */}
      <WriteReviewModal
        product={product}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitSuccess={handleReviewSubmitted}
      />
    </div>
  );
}
