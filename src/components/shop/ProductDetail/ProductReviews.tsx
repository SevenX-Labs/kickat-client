"use client";

import { useState } from 'react';
import { Star, Edit3 } from 'lucide-react';
import Image from 'next/image';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

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
  const reviewsCount = product.reviewsCount || 64;
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <div className={styles.reviewsMainWrapper} id="reviews">
      <h2 className={styles.reviewsSectionHeaderTitle}>Customer Reviews</h2>

      {/* Top Ratings Overview Row */}
      <div className={styles.reviewsOverviewCard}>
        {/* Left: Big Rating Number & Stars */}
        <div className={styles.ratingNumberBlock}>
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
            <span className={styles.basedOnText}>Based on {reviewsCount} reviews</span>
          </div>
        </div>

        {/* Center: Rating Progress Bars */}
        <div className={styles.ratingProgressBarsCol}>
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
        <h3 className={styles.customerPhotosTitle}>Customer Photos</h3>
        <div className={styles.customerPhotosRow}>
          {CUSTOMER_PHOTOS.map((photo, idx) => (
            <div key={idx} className={styles.photoTileWrap}>
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
          <div className={`${styles.photoTileWrap} ${styles.morePhotosTile}`}>
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

      {showReviewModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3>Write a Review</h3>
            <p>Share your experience with {product.name || 'this product'}.</p>
            <textarea className={styles.modalTextarea} placeholder="Write your review here..." rows={4} />
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setShowReviewModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button type="button" onClick={() => { alert('Thank you for your review!'); setShowReviewModal(false); }} className={styles.submitBtn}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
