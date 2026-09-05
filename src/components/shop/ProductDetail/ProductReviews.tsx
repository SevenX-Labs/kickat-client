"use client";

import { useState } from 'react';
import { Star, Edit3, ArrowRight, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';
import { ReviewsDrawer } from './ReviewsDrawer';
import { WriteReviewModal } from './WriteReviewModal';

interface ProductReviewsProps {
  product: Product;
}

const RATING_BREAKDOWN = [
  { stars: 5, percentage: 68 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 8 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 1 },
];

const CUSTOMER_PHOTOS = [
  '/hero-products/dog_food.png',
  '/hero-products/pet_toy.png',
  '/hero-products/pet_bowl.png',
  '/hero-products/cat_treats.png',
  '/hero-products/bird_seed.png',
];

export function ProductReviews({ product }: ProductReviewsProps) {
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 142;
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
            background: 'rgba(253, 128, 46, 0.08)',
            color: '#FD802E',
            border: '1px solid rgba(253, 128, 46, 0.2)',
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
        {/* Left: Big Rating Number & Stars */}
        <div className={styles.ratingNumberBlock} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
          <span className={styles.bigRatingScore}>{rating}</span>
          <div className={styles.ratingStarsCol}>
            <div className={styles.starsRowInline}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill="#FD802E"
                  color="#FD802E"
                  strokeWidth={1}
                />
              ))}
            </div>
            <span className={styles.basedOnText} style={{ textDecoration: 'underline' }}>Based on {reviewsCount} reviews</span>
          </div>
        </div>

        {/* Center: Rating Progress Bars */}
        <div className={styles.ratingProgressBarsCol} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
          {RATING_BREAKDOWN.map((item) => (
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
              color: '#FD802E',
              fontWeight: '700',
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            See all reviews →
          </button>
        </div>

        <div className={styles.customerPhotosRow}>
          {CUSTOMER_PHOTOS.map((photo, idx) => (
            <div key={idx} className={styles.photoTileWrap} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
              <Image
                src={photo}
                alt={`Customer review photo ${idx + 1}`}
                fill
                sizes="120px"
                className={styles.customerPhotoImg}
              />
            </div>
          ))}

          {/* +12 More Tile */}
          <div 
            className={`${styles.photoTileWrap} ${styles.morePhotosTile}`} 
            onClick={() => setIsDrawerOpen(true)} 
            style={{ cursor: 'pointer' }}
          >
            <Image
              src={CUSTOMER_PHOTOS[0]}
              alt="More customer photos"
              fill
              sizes="120px"
              className={styles.customerPhotoImg}
            />
            <div className={styles.morePhotosOverlay}>
              <span className={styles.moreCountText}>+12</span>
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
      />
    </div>
  );
}

