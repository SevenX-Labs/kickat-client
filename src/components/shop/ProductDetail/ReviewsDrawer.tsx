"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  CheckCircle2,
  ThumbsUp,
  Edit3,
  Camera,
  MessageSquareHeart,
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
    if (diffInMonths < 12) return `${diffInMonths} mo ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function ReviewsDrawer({ product, isOpen, onClose, onWriteReview }: ReviewsDrawerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
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
        limit: 100,
        sort: 'newest',
      });
      if (res && res.reviews) {
        setReviews(res.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.warn('Could not fetch reviews in drawer:', err);
      setReviews([]);
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

  // Toggle helpful vote on a review
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
      }
    } catch (err: unknown) {
      console.warn('Could not mark review as helpful:', err);
    }
  };

  if (!isOpen) return null;

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (selectedFilter === '5') return rev.rating === 5;
    if (selectedFilter === '4') return rev.rating === 4;
    if (selectedFilter === '3') return rev.rating <= 3;
    if (selectedFilter === 'photos') return rev.photos && rev.photos.length > 0;
    return true;
  });

  // Dynamic stats
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
      : (product.rating || 0).toFixed(1);

  // Aggregate all customer photos across reviews
  const allCustomerPhotos = reviews.flatMap((r) => r.photos || []).filter(Boolean);

  const count5 = reviews.filter((r) => r.rating === 5).length;
  const count4 = reviews.filter((r) => r.rating === 4).length;
  const count3 = reviews.filter((r) => r.rating <= 3).length;
  const countPhotos = allCustomerPhotos.length;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Slide-over Drawer */}
      <aside className={styles.drawerCard} aria-label="Customer Reviews Drawer">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.title}>Customer Feedback</h3>
            {totalReviewsCount > 0 && (
              <span className={styles.badgeRating}>
                <Star size={13} fill="#F99205" color="#F99205" strokeWidth={0} />
                <span>{avgRating} ({totalReviewsCount})</span>
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close reviews drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.contentScrollable}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem' }}>
              <Loader2 size={32} className="animate-spin" color="#F99205" />
              <p style={{ color: '#78746D', fontSize: '0.9rem', margin: 0 }}>Loading reviews...</p>
            </div>
          ) : totalReviewsCount === 0 ? (
            /* Clean Empty State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: '#FAF6F0',
              borderRadius: '20px',
              border: '1px solid #EBE5DB',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#FFF4E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F99205'
              }}>
                <MessageSquareHeart size={30} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1A1612', margin: 0 }}>
                No customer reviews yet
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#666055', lineHeight: 1.5, margin: 0, maxWidth: '320px' }}>
                Be the first person to share your experience with {product.name || 'this item'}!
              </p>
              <button
                type="button"
                className={styles.writeBtn}
                onClick={() => {
                  onClose();
                  onWriteReview();
                }}
                style={{ marginTop: '0.5rem' }}
              >
                <Edit3 size={15} />
                <span>Write a Review</span>
              </button>
            </div>
          ) : (
            <>
              {/* Summary Score Card */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryScoreBlock}>
                  <span className={styles.bigScore}>{avgRating}</span>
                  <div className={styles.scoreSub}>
                    <div className={styles.starsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.round(Number(avgRating)) ? "#F99205" : "#E0DCD4"}
                          color={i < Math.round(Number(avgRating)) ? "#F99205" : "#E0DCD4"}
                          strokeWidth={0}
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

              {/* Photo Gallery Strip if photos exist */}
              {allCustomerPhotos.length > 0 && (
                <div className={styles.photoSection}>
                  <span className={styles.photoSectionTitle}>Customer Photos ({allCustomerPhotos.length})</span>
                  <div className={styles.photoStrip}>
                    {allCustomerPhotos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        className={styles.thumbTile}
                        onClick={() => setPreviewPhoto(photo)}
                      >
                        <Image
                          src={photo}
                          alt={`Customer photo ${pIdx + 1}`}
                          fill
                          sizes="80px"
                          className={styles.thumbImg}
                          unoptimized={photo.startsWith('data:')}
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
                  All ({totalReviewsCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${selectedFilter === '5' ? styles.activeFilterPill : ''}`}
                  onClick={() => setSelectedFilter('5')}
                >
                  5 ★ ({count5})
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${selectedFilter === '4' ? styles.activeFilterPill : ''}`}
                  onClick={() => setSelectedFilter('4')}
                >
                  4 ★ ({count4})
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${selectedFilter === '3' ? styles.activeFilterPill : ''}`}
                  onClick={() => setSelectedFilter('3')}
                >
                  3 ★ &amp; below ({count3})
                </button>
                {allCustomerPhotos.length > 0 && (
                  <button
                    type="button"
                    className={`${styles.filterPill} ${selectedFilter === 'photos' ? styles.activeFilterPill : ''}`}
                    onClick={() => setSelectedFilter('photos')}
                  >
                    <Camera size={13} />
                    With Photos ({countPhotos})
                  </button>
                )}
              </div>

              {/* Reviews List */}
              <div className={styles.reviewsList}>
                {filteredReviews.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#78746D', fontSize: '0.875rem', padding: '2rem 0' }}>
                    No reviews match the selected filter.
                  </p>
                ) : (
                  filteredReviews.map((rev) => {
                    const userInitial = rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U';
                    const isHelpful = helpfulVotes[rev.id] ?? false;
                    const helpfulCount = helpfulCountMap[rev.id] ?? rev.helpfulCount ?? 0;

                    return (
                      <div key={rev.id} className={styles.reviewCard}>
                        <div className={styles.reviewCardHeader}>
                          <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>{userInitial}</div>
                            <div className={styles.userNameBlock}>
                              <span className={styles.userName}>{rev.userName || 'Verified Customer'}</span>
                              {rev.isVerifiedPurchase && (
                                <span className={styles.verifiedBadge}>
                                  <CheckCircle2 size={13} strokeWidth={2.5} />
                                  <span>Verified Purchase</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={styles.reviewDate}>{formatRelativeTime(rev.createdAt)}</span>
                        </div>

                        <div className={styles.reviewCardBody}>
                          <div className={styles.starsRow}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < rev.rating ? "#F99205" : "#E0DCD4"}
                                color={i < rev.rating ? "#F99205" : "#E0DCD4"}
                                strokeWidth={0}
                              />
                            ))}
                          </div>

                          {rev.title && <h4 className={styles.reviewCardTitle}>{rev.title}</h4>}
                          <p className={styles.reviewCardText}>{rev.comment}</p>

                          {rev.photos && rev.photos.length > 0 && (
                            <div className={styles.reviewPhotoRow}>
                              {rev.photos.map((p, pIdx) => (
                                <div
                                  key={pIdx}
                                  className={styles.reviewPhotoThumb}
                                  onClick={() => setPreviewPhoto(p)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <Image
                                    src={p}
                                    alt={`Review photo ${pIdx + 1}`}
                                    fill
                                    sizes="60px"
                                    className={styles.thumbImg}
                                    unoptimized={p.startsWith('data:')}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {rev.adminReply && (
                            <div className={styles.adminReplyBox}>
                              <div className={styles.adminReplyHeader}>
                                <span className={styles.adminReplyBadge}>Official Store Reply</span>
                                {rev.adminReplyAt && (
                                  <span className={styles.adminReplyDate}>
                                    {formatRelativeTime(rev.adminReplyAt)}
                                  </span>
                                )}
                              </div>
                              <p className={styles.adminReplyText}>{rev.adminReply}</p>
                            </div>
                          )}

                          <button
                            type="button"
                            className={`${styles.helpfulBtn} ${isHelpful ? styles.helpfulActive : ''}`}
                            onClick={() => toggleHelpful(rev.id)}
                          >
                            <ThumbsUp size={13} />
                            <span>Helpful ({helpfulCount})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Lightbox photo preview */}
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
              alt="Customer review full preview"
              fill
              style={{ objectFit: 'contain' }}
              unoptimized={previewPhoto.startsWith('data:')}
            />
          </div>
        </div>
      )}
    </>
  );
}
