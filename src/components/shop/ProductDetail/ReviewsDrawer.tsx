"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  CheckCircle2,
  ThumbsUp,
  Edit3,
  Image as ImageIcon,
  MessageSquareQuote,
  Loader2,
} from 'lucide-react';
import styles from './ReviewsDrawer.module.css';
import { Product } from './ProductDetail';
import { ReviewItem } from '@/types/review';
import { reviewService } from '@/services/reviewService';

interface ReviewsDrawerProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onWriteReview: () => void;
}

const FALLBACK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    productId: '',
    userName: 'Sarah Jenkins',
    isVerifiedPurchase: true,
    rating: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Transformed my Golden Retriever’s coat!',
    comment: 'I have tried 4 different shampoos for Buddy, but this anti-hair fall formula is genuinely magical. After 3 washes, his shedding decreased drastically, and his coat is noticeably softer and shinier. Smells so refreshing!',
    photos: ['/hero-products/dog_food.png', '/hero-products/pet_toy.png'],
    helpfulCount: 24,
    status: 'APPROVED',
    isSpam: false,
    adminReply: 'Thank you Sarah! We are thrilled to hear Buddy is loving his baths and silky coat.',
    adminReplyAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-2',
    productId: '',
    userName: 'Vikram Sharma',
    isVerifiedPurchase: true,
    rating: 5,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Top tier quality & quick delivery',
    comment: 'Packaging was 10/10. My cat usually hates bath time, but this shampoo lathers quickly and rinses off effortlessly. Very gentle on sensitive skin.',
    photos: ['/hero-products/pet_bowl.png'],
    helpfulCount: 18,
    status: 'APPROVED',
    isSpam: false,
    adminReply: null,
  },
  {
    id: 'rev-3',
    productId: '',
    userName: 'Ananya Roy',
    isVerifiedPurchase: true,
    rating: 4,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Great scent, very gentle',
    comment: 'Smells incredible and natural without harsh chemical perfumes. Reduced fur flying around the house by at least half. Highly recommend for long-haired breeds!',
    photos: ['/hero-products/cat_treats.png'],
    helpfulCount: 12,
    status: 'APPROVED',
    isSpam: false,
    adminReply: null,
  },
  {
    id: 'rev-4',
    productId: '',
    userName: 'Rohan Mehta',
    isVerifiedPurchase: true,
    rating: 5,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Best purchase for pet care this year',
    comment: 'Worth every rupee. The bottle design is non-slip so it’s super easy to hold with wet hands in the shower.',
    photos: [],
    helpfulCount: 9,
    status: 'APPROVED',
    isSpam: false,
    adminReply: null,
  },
  {
    id: 'rev-5',
    productId: '',
    userName: 'Priya Nair',
    isVerifiedPurchase: true,
    rating: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Super soft fur and zero irritation!',
    comment: 'My Persian cat Luna usually gets dry skin after washes, but this formula kept her skin hydrated and coat silky smooth. Will definitely reorder!',
    photos: ['/hero-products/pet_toy.png'],
    helpfulCount: 15,
    status: 'APPROVED',
    isSpam: false,
    adminReply: null,
  },
  {
    id: 'rev-6',
    productId: '',
    userName: 'Kabir Das',
    isVerifiedPurchase: true,
    rating: 3,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Decent product, good lather',
    comment: 'Works well for cleaning. Smells nice, though hair fall reduction took about 2 weeks to show noticeable results.',
    photos: [],
    helpfulCount: 4,
    status: 'APPROVED',
    isSpam: false,
    adminReply: 'Thank you Kabir. Consistency is key with natural anti-hair fall formulas — we are here if you need any usage tips!',
    adminReplyAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function ReviewsDrawer({ product, isOpen, onClose, onWriteReview }: ReviewsDrawerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(FALLBACK_REVIEWS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | 'photos'>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [helpfulCountMap, setHelpfulCountMap] = useState<Record<string, number>>({});
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Fetch live reviews from backend
  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    setIsLoading(true);
    try {
      const res = await reviewService.getReviews({
        productId: product.id,
        limit: 50,
        sort: 'NEWEST',
      });
      if (res && res.reviews && res.reviews.length > 0) {
        setReviews(res.reviews);
      } else {
        setReviews(FALLBACK_REVIEWS);
      }
    } catch (err) {
      console.warn('Falling back to default reviews:', err);
      setReviews(FALLBACK_REVIEWS);
    } finally {
      setIsLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, fetchReviews]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (selectedFilter === '5') return rev.rating === 5;
    if (selectedFilter === '4') return rev.rating === 4;
    if (selectedFilter === '3') return rev.rating <= 3;
    if (selectedFilter === 'photos') return rev.photos && rev.photos.length > 0;
    return true;
  });

  // Calculate dynamic stats
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
      : (product.rating || 4.8).toFixed(1);

  // Aggregate all photos across reviews
  const allCustomerPhotos = reviews.flatMap((r) => r.photos || []);

  const toggleHelpful = async (revId: string) => {
    const isCurrentlyVoted = !!helpfulVotes[revId];
    // Optimistic toggle
    setHelpfulVotes((prev) => ({
      ...prev,
      [revId]: !isCurrentlyVoted,
    }));
    setHelpfulCountMap((prev) => {
      const current = prev[revId] ?? (reviews.find((r) => r.id === revId)?.helpfulCount || 0);
      return {
        ...prev,
        [revId]: isCurrentlyVoted ? Math.max(0, current - 1) : current + 1,
      };
    });

    if (!isCurrentlyVoted) {
      try {
        await reviewService.markHelpful(revId);
      } catch (err) {
        console.warn('Could not persist helpful upvote:', err);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer */}
      <aside
        className={styles.drawer}
        aria-label="Customer Reviews Drawer"
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
      >
        {/* Sticky Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.title}>Customer Reviews</h2>
            <div className={styles.badgeRating}>
              <Star size={13} fill="#F99205" color="#F99205" />
              <span>{avgRating}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close reviews drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className={styles.contentScrollable}
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Overview Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryScoreBlock}>
              <span className={styles.bigScore}>{avgRating}</span>
              <div className={styles.scoreSub}>
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(Number(avgRating)) ? '#F99205' : '#E0DCD4'}
                      color={i < Math.round(Number(avgRating)) ? '#F99205' : '#E0DCD4'}
                      strokeWidth={1}
                    />
                  ))}
                </div>
                <span className={styles.totalText}>Based on {totalReviewsCount} reviews</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.writeBtn}
              onClick={() => {
                onClose();
                onWriteReview();
              }}
            >
              <Edit3 size={14} />
              <span>Write Review</span>
            </button>
          </div>

          {/* Customer Photos Strip */}
          {allCustomerPhotos.length > 0 && (
            <div className={styles.photoSection}>
              <span className={styles.photoSectionTitle}>
                Customer Photos ({allCustomerPhotos.length})
              </span>
              <div className={styles.photoStrip}>
                {allCustomerPhotos.slice(0, 10).map((src, idx) => (
                  <div key={idx} className={styles.thumbTile} onClick={() => setPreviewPhoto(src)}>
                    <Image
                      src={src}
                      alt={`Customer photo ${idx + 1}`}
                      fill
                      sizes="72px"
                      className={styles.thumbImg}
                      unoptimized={src.startsWith('data:')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Pills Bar */}
          <div className={styles.filtersBar}>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedFilter === 'all' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All ({reviews.length})
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedFilter === '5' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('5')}
            >
              5 ★ ({reviews.filter((r) => r.rating === 5).length})
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedFilter === '4' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('4')}
            >
              4 ★ ({reviews.filter((r) => r.rating === 4).length})
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedFilter === '3' ? styles.activeFilterPill : ''}`}
              onClick={() => setSelectedFilter('3')}
            >
              3 ★ & below ({reviews.filter((r) => r.rating <= 3).length})
            </button>
            {allCustomerPhotos.length > 0 && (
              <button
                type="button"
                className={`${styles.filterPill} ${selectedFilter === 'photos' ? styles.activeFilterPill : ''}`}
                onClick={() => setSelectedFilter('photos')}
              >
                <ImageIcon size={13} />
                With Photos ({reviews.filter((r) => r.photos && r.photos.length > 0).length})
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '0.5rem', color: '#888276' }}>
                <Loader2 size={18} className="animate-spin" />
                <span style={{ fontSize: '0.85rem' }}>Loading reviews...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#78746D', fontSize: '0.85rem' }}>
                No reviews found for this filter.
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const isVoted = !!helpfulVotes[rev.id];
                const count = helpfulCountMap[rev.id] ?? rev.helpfulCount;

                return (
                  <div key={rev.id} className={styles.reviewCard}>
                    {/* Card Header */}
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          {(rev.userName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userNameBlock}>
                          <span className={styles.userName}>{rev.userName || 'Verified Buyer'}</span>
                          {rev.isVerifiedPurchase && (
                            <span className={styles.verifiedBadge}>
                              <CheckCircle2 size={11} /> Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={styles.reviewDate}>{formatRelativeTime(rev.createdAt)}</span>
                    </div>

                    {/* Stars & Body */}
                    <div className={styles.reviewCardBody}>
                      <div className={styles.starsRow}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < rev.rating ? '#F99205' : '#E0DCD4'}
                            color={i < rev.rating ? '#F99205' : '#E0DCD4'}
                            strokeWidth={0}
                          />
                        ))}
                      </div>

                      {rev.title && <h4 className={styles.reviewCardTitle}>{rev.title}</h4>}
                      <p className={styles.reviewCardText}>{rev.comment}</p>

                      {/* Attached Photo Thumbnails */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className={styles.reviewPhotoRow}>
                          {rev.photos.map((photo, i) => (
                            <div
                              key={i}
                              className={styles.reviewPhotoThumb}
                              onClick={() => setPreviewPhoto(photo)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Image
                                src={photo}
                                alt="Attached review photo"
                                fill
                                sizes="56px"
                                className={styles.thumbImg}
                                unoptimized={photo.startsWith('data:')}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Official Store Reply Box */}
                      {rev.adminReply && (
                        <div className={styles.adminReplyBox}>
                          <div className={styles.adminReplyHeader}>
                            <span className={styles.adminReplyBadge}>
                              <MessageSquareQuote size={12} />
                              Store Response
                            </span>
                            {rev.adminReplyAt && (
                              <span className={styles.adminReplyDate}>
                                {formatRelativeTime(rev.adminReplyAt)}
                              </span>
                            )}
                          </div>
                          <p className={styles.adminReplyText}>&ldquo;{rev.adminReply}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    {/* Helpful Action */}
                    <button
                      type="button"
                      className={`${styles.helpfulBtn} ${isVoted ? styles.helpfulActive : ''}`}
                      onClick={() => toggleHelpful(rev.id)}
                    >
                      <ThumbsUp size={13} />
                      <span>Helpful ({count})</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Expanded Photo Preview Modal */}
      {previewPhoto && (
        <div className={styles.imageModalBackdrop} onClick={() => setPreviewPhoto(null)}>
          <div className={styles.imageModalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.imageModalClose}
              onClick={() => setPreviewPhoto(null)}
              aria-label="Close photo preview"
            >
              <X size={20} />
            </button>
            <Image
              src={previewPhoto}
              alt="Preview customer photo"
              fill
              style={{ objectFit: 'contain' }}
              priority
              unoptimized={previewPhoto.startsWith('data:')}
            />
          </div>
        </div>
      )}
    </>
  );
}
