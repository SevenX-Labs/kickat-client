"use client";

import { useState, useEffect, useCallback } from 'react';
import { Star, Edit3, ArrowRight, MessageSquare, Loader2, ThumbsUp, CheckCircle2, MessageSquareHeart } from 'lucide-react';
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

export function ProductReviews({ product }: ProductReviewsProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<ReviewSummaryData | null>(null);
  const [liveReviews, setLiveReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [helpfulCountMap, setHelpfulCountMap] = useState<Record<string, number>>({});
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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
      console.warn('Could not load live reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchSummaryAndReviews();
  }, [fetchSummaryAndReviews]);

  const totalReviewsCount = summary?.totalReviews ?? liveReviews.length ?? (product.reviewsCount || 0);
  const avgRating = summary?.averageRating || (totalReviewsCount > 0 ? (liveReviews.reduce((acc, r) => acc + r.rating, 0) / (liveReviews.length || 1)) : product.rating || 0);

  // Build 5 -> 1 rating breakdown percentages dynamically
  const dist = summary?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalInDist = Object.values(dist).reduce((acc, val) => acc + val, 0);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = dist[stars as 1 | 2 | 3 | 4 | 5] || 0;
    const percentage = totalInDist > 0 ? Math.round((count / totalInDist) * 100) : 0;
    return { stars, count, percentage };
  });

  // Extract photos attached to customer reviews
  const customerPhotos = liveReviews.flatMap((r) => r.photos || []).filter(Boolean);

  const handleReviewSubmitted = () => {
    fetchSummaryAndReviews();
  };

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
    } catch (err) {
      console.warn('Could not update helpful vote:', err);
    }
  };

  // Preview the first 3 approved reviews on the main page
  const displayedReviews = liveReviews.slice(0, 3);

  return (
    <div className={styles.reviewsMainWrapper} id="reviews">
      <div className={styles.reviewsHeaderRow}>
        <div className={styles.reviewsHeaderTitleGroup}>
          <h2 className={styles.reviewsSectionHeaderTitle}>Customer Reviews</h2>
          {totalReviewsCount > 0 && (
            <span className={styles.reviewsCountBadge}>
              {totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'}
            </span>
          )}
        </div>

        {totalReviewsCount > 0 && (
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={styles.seeAllReviewsBtn}
          >
            <MessageSquare size={15} />
            <span>See All {totalReviewsCount} Reviews</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.reviewsLoadingState}>
          <Loader2 size={28} className="animate-spin" color="#F99205" />
          <span>Loading customer reviews...</span>
        </div>
      ) : totalReviewsCount === 0 ? (
        /* Clean Empty State when product has 0 reviews */
        <div className={styles.reviewsEmptyStateCard}>
          <div className={styles.emptyIconWrap}>
            <MessageSquareHeart size={32} color="#F99205" />
          </div>
          <div className={styles.emptyTextContent}>
            <h3 className={styles.emptyTitle}>No customer reviews yet</h3>
            <p className={styles.emptySubtitle}>
              Have you tried {product.name || 'this product'}? Share your thoughts and help other pet parents make the right choice!
            </p>
          </div>
          <button
            type="button"
            className={styles.writeFirstReviewBtn}
            onClick={() => setShowReviewModal(true)}
          >
            <Edit3 size={16} />
            <span>Write the First Review</span>
          </button>
        </div>
      ) : (
        /* Top Ratings Overview Row */
        <>
          <div className={styles.reviewsOverviewCard}>
            {/* Left: Big Rating Score & Stars */}
            <div className={styles.ratingNumberBlock} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
              <span className={styles.bigRatingScore}>
                {typeof avgRating === 'number' ? avgRating.toFixed(1) : Number(avgRating || 0).toFixed(1)}
              </span>
              <div className={styles.ratingStarsCol}>
                <div className={styles.starsRowInline}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.round(Number(avgRating)) ? "#F99205" : "#E0DCD4"}
                      color={i < Math.round(Number(avgRating)) ? "#F99205" : "#E0DCD4"}
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className={styles.basedOnText}>Based on {totalReviewsCount} verified reviews</span>
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

          {/* Real Customer Photos Row if present */}
          {customerPhotos.length > 0 && (
            <div className={styles.customerPhotosSection}>
              <div className={styles.customerPhotosHeaderRow}>
                <h3 className={styles.customerPhotosTitle}>
                  Customer Photos ({customerPhotos.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className={styles.seeAllPhotosLink}
                >
                  View in drawer →
                </button>
              </div>

              <div className={styles.customerPhotosRow}>
                {customerPhotos.slice(0, 6).map((photo, idx) => (
                  <div
                    key={idx}
                    className={styles.photoTileWrap}
                    onClick={() => setPreviewPhoto(photo)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Image
                      src={photo}
                      alt={`Customer review photo ${idx + 1}`}
                      fill
                      sizes="100px"
                      className={styles.customerPhotoImg}
                      unoptimized={photo.startsWith('data:')}
                    />
                  </div>
                ))}
                {customerPhotos.length > 6 && (
                  <div
                    className={`${styles.photoTileWrap} ${styles.morePhotosTile}`}
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Image
                      src={customerPhotos[6]}
                      alt="More customer photos"
                      fill
                      sizes="100px"
                      className={styles.customerPhotoImg}
                      unoptimized={customerPhotos[6]?.startsWith('data:')}
                    />
                    <div className={styles.morePhotosOverlay}>
                      <span className={styles.moreCountText}>+{customerPhotos.length - 6}</span>
                      <span className={styles.moreLabelText}>More</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Reviews List on PDP */}
          {displayedReviews.length > 0 && (
            <div className={styles.productReviewsList}>
              {displayedReviews.map((rev) => {
                const userInitial = rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U';
                const isHelpful = helpfulVotes[rev.id] ?? false;
                const helpfulCount = helpfulCountMap[rev.id] ?? rev.helpfulCount ?? 0;

                return (
                  <div key={rev.id} className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{userInitial}</div>
                        <div className={styles.userNameBlock}>
                          <span className={styles.userName}>{rev.userName || 'Verified Buyer'}</span>
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
                      <div className={styles.starsRowInline}>
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
                            >
                              <Image
                                src={p}
                                alt={`Review photo ${pIdx + 1}`}
                                fill
                                sizes="60px"
                                className={styles.customerPhotoImg}
                                unoptimized={p.startsWith('data:')}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {rev.adminReply && (
                        <div className={styles.adminReplyBox}>
                          <div className={styles.adminReplyHeader}>
                            <span className={styles.adminReplyBadge}>KickAt Care Response</span>
                            {rev.adminReplyAt && (
                              <span className={styles.adminReplyDate}>{formatRelativeTime(rev.adminReplyAt)}</span>
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
              })}

              {totalReviewsCount > 3 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className={styles.loadMoreReviewsBtn}
                  >
                    View All {totalReviewsCount} Customer Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

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

      {/* Photo Lightbox Preview */}
      {previewPhoto && (
        <div className={styles.lightboxModalBackdrop} onClick={() => setPreviewPhoto(null)}>
          <div className={styles.lightboxModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImageWrap}>
              <Image
                src={previewPhoto}
                alt="Customer review photo"
                fill
                className={styles.lightboxImage}
                unoptimized={previewPhoto.startsWith('data:')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
