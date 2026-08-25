"use client";

import { useState, useRef } from 'react';
import { Star, ThumbsUp, CheckCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import styles from './ProductReviews.module.css';
import { Product } from './ProductDetail';

interface ProductReviewsProps {
  product: Product;
}

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Sarah J.',
    date: 'August 12, 2026',
    rating: 5,
    title: 'Absolutely perfect for my pet!',
    content: 'I was hesitant at first, but the quality is outstanding. The materials feel premium and it is exactly as described. My dog loves it. Highly recommend to anyone looking for a durable product.',
    verified: true,
    helpful: 24,
    avatarColor: '#E7A03B',
    photos: ['/hero-products/dog_food.png', '/hero-products/cat_treats.png'],
  },
  {
    id: 2,
    name: 'Michael T.',
    date: 'August 5, 2026',
    rating: 4,
    title: 'Great quality, fast shipping',
    content: 'Very happy with this purchase. It looks great and feels very durable. Knocking off one star just because the packaging was slightly damaged, but the product was pristine.',
    verified: true,
    helpful: 12,
    avatarColor: '#4CAF50',
  },
  {
    id: 3,
    name: 'Emily R.',
    date: 'July 28, 2026',
    rating: 5,
    title: 'Exceeded expectations',
    content: 'Beautifully designed and very functional. You can tell a lot of thought went into making this. Would highly recommend to any pet owner.',
    verified: false,
    helpful: 8,
    avatarColor: '#2196F3',
  },
  {
    id: 4,
    name: 'David L.',
    date: 'July 15, 2026',
    rating: 5,
    title: 'Worth every penny',
    content: 'The craftsmanship is top-notch. I have tried several other brands, but nothing comes close to this level of detail. My pet instantly took to it.',
    verified: true,
    helpful: 35,
    avatarColor: '#9C27B0',
    photos: ['/hero-products/bird_seed.png'],
  },
  {
    id: 5,
    name: 'Jessica W.',
    date: 'July 2, 2026',
    rating: 4,
    title: 'Solid product',
    content: 'Good material and it fits perfectly. Only issue is that it took a while to arrive, but the support team was very helpful and responsive.',
    verified: true,
    helpful: 5,
    avatarColor: '#F44336',
  }
];

const RATING_BREAKDOWN = [
  { stars: 5, percentage: 68 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 8 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 1 },
];

export function ProductReviews({ product }: ProductReviewsProps) {
  const rating = product.rating || 4.2;
  const reviewsCount = product.reviewsCount || 128;
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});
  const [helpfulClicked, setHelpfulClicked] = useState<Record<number, boolean>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: number) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHelpful = (id: number) => {
    setHelpfulClicked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.reviewsContainer} id="reviews">
      <h2 className={styles.sectionTitle}>Customer Reviews</h2>
      
      <div className={styles.reviewsHeader}>
        {/* Rating Summary Panel */}
        <div className={styles.ratingSummaryPanel}>
          <div className={styles.ratingBigNumberBlock}>
            <span className={styles.bigRating}>{rating}</span>
            <div className={styles.ratingStarsCol}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i < Math.floor(rating) ? "#E7A03B" : "none"} 
                    color={i < Math.floor(rating) ? "#E7A03B" : "#dcdcdc"} 
                    strokeWidth={2}
                  />
                ))}
              </div>
              <span className={styles.ratingSubtitle}>Based on {reviewsCount} reviews</span>
            </div>
          </div>
          <div className={styles.ratingBars}>
            {RATING_BREAKDOWN.map((row) => (
              <div key={row.stars} className={styles.ratingBarRow}>
                <span className={styles.starLabel}>{row.stars}★</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${row.percentage}%` }}></div>
                </div>
                <span className={styles.percentLabel}>{row.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className={styles.headerControls}>
          <div className={styles.sortDropdown}>
            <span className={styles.sortLabel}>Sort by:</span>
            <button className={styles.sortBtn}>
              Most Helpful <ChevronDown size={14} />
            </button>
          </div>
          <button className={styles.writeReviewBtn}>Write a Review</button>
        </div>
      </div>

      {/* Reviews Slider */}
      <div className={styles.sliderWrapper}>
        <button className={`${styles.sliderBtn} ${styles.leftBtn}`} onClick={scrollLeft}>
          <ChevronLeft size={24} />
        </button>

        <div className={styles.reviewsSlider} ref={sliderRef}>
          {MOCK_REVIEWS.map(review => {
            const isExpanded = expandedReviews[review.id];
            const isHelpful = helpfulClicked[review.id];
            
            return (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar} style={{ backgroundColor: review.avatarColor }}>
                    {review.name.charAt(0)}
                  </div>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerNameRow}>
                      <span className={styles.reviewerName}>{review.name}</span>
                      {review.verified && (
                        <span className={styles.verifiedBadge}>
                          <CheckCircle size={12} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                </div>

                <div className={styles.reviewStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < review.rating ? "#E7A03B" : "none"} 
                      color={i < review.rating ? "#E7A03B" : "#dcdcdc"} 
                      strokeWidth={2}
                    />
                  ))}
                </div>
                
                <h4 className={styles.reviewTitle}>{review.title}</h4>
                
                <div className={styles.reviewBodyContainer}>
                  <p className={`${styles.reviewContent} ${isExpanded ? styles.expanded : ''}`}>
                    {review.content}
                  </p>
                  {review.content.length > 120 && (
                    <button className={styles.readMoreBtn} onClick={() => toggleExpand(review.id)}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                {review.photos && review.photos.length > 0 && (
                  <div className={styles.reviewPhotos}>
                    {review.photos.map((photo, idx) => (
                      <div key={idx} className={styles.photoThumbnail}>
                        <Image src={photo} alt="Customer photo" fill className={styles.photoImage} />
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <button 
                    className={`${styles.helpfulBtn} ${isHelpful ? styles.helpfulActive : ''}`}
                    onClick={() => toggleHelpful(review.id)}
                  >
                    <ThumbsUp size={14} /> Helpful? ({review.helpful + (isHelpful ? 1 : 0)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button className={`${styles.sliderBtn} ${styles.rightBtn}`} onClick={scrollRight}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
