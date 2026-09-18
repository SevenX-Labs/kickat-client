"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Star, X, CheckCircle2, Camera, Image as ImageIcon, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import styles from './WriteReviewModal.module.css';
import { Product } from './ProductDetail';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '@/services/reviewService';
import { ReviewItem } from '@/types/review';
import { api } from '@/services/api';

interface WriteReviewModalProps {
  product: Product;
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (review: ReviewItem) => void;
}

const RATING_LABELS: Record<number, string> = {
  5: '5.0 - Excellent',
  4: '4.0 - Good',
  3: '3.0 - Average',
  2: '2.0 - Poor',
  1: '1.0 - Terrible',
};

/**
 * Utility function to compress images client-side to WebP format under 2MB.
 */
async function compressImageToWebP(file: File, maxSizeBytes: number = 2 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const MAX_DIMENSION = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/webp', quality);

        const calculateByteSize = (url: string) => {
          const base64Length = url.length - (url.indexOf(',') + 1);
          return Math.round((base64Length * 3) / 4);
        };

        while (calculateByteSize(dataUrl) > maxSizeBytes && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/webp', quality);
        }

        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function WriteReviewModal({
  product,
  orderId: initialOrderId,
  isOpen,
  onClose,
  onSubmitSuccess,
}: WriteReviewModalProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string>(initialOrderId || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [checkingPurchaser, setCheckingPurchaser] = useState<boolean>(false);
  const [isVerifiedPurchaser, setIsVerifiedPurchaser] = useState<boolean>(true);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync initial orderId if provided
  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  // If orderId is missing, check user orders for delivered item
  useEffect(() => {
    if (!isOpen) return;

    const checkDeliveredOrder = async () => {
      if (!isAuthenticated) {
        // Guest user: allowed to enter orderId manually or inform them
        return;
      }

      if (initialOrderId) {
        setOrderId(initialOrderId);
        return;
      }

      try {
        setCheckingPurchaser(true);
        const res = await api<{ success: boolean; orders: Array<{ id: string; orderStatus: string; items: Array<{ productId: string }> }> }>('/orders');
        if (res && res.orders) {
          const deliveredMatch = res.orders.find(
            (o) =>
              (o.orderStatus === 'DELIVERED' || o.orderStatus === 'Delivered') &&
              o.items?.some((it) => it.productId === product.id)
          );
          if (deliveredMatch) {
            setOrderId(deliveredMatch.id);
            setIsVerifiedPurchaser(true);
          }
        }
      } catch (err) {
        console.warn('Could not auto-fetch delivered orders:', err);
      } finally {
        setCheckingPurchaser(false);
      }
    };

    checkDeliveredOrder();
  }, [isOpen, initialOrderId, product.id]);

  if (!isOpen) return null;

  const processAndAddFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    if (previewImages.length + validFiles.length > 5) {
      setErrorMessage('You can upload up to 5 photos per review.');
      return;
    }

    setIsCompressing(true);
    setErrorMessage(null);
    try {
      const compressedWebpUrls = await Promise.all(
        validFiles.map((file) => compressImageToWebP(file, 2 * 1024 * 1024))
      );
      setPreviewImages((prev) => [...prev, ...compressedWebpUrls].slice(0, 5));
    } catch (err) {
      console.error('Image compression failed:', err);
      setErrorMessage('Failed to process image. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processAndAddFiles(files);
    }
    const inputElement = e.target;
    setTimeout(() => {
      if (inputElement) inputElement.value = '';
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processAndAddFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!message || message.trim().length < 10) {
      setErrorMessage('Please write at least 10 characters sharing your honest feedback.');
      return;
    }

    if (!isAuthenticated) {
      setErrorMessage('Please log in to submit a verified purchase review.');
      return;
    }

    const effectiveOrderId = orderId.trim();
    if (!effectiveOrderId) {
      setErrorMessage('Review submission requires a verified delivered order. Please select or provide your Order ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await reviewService.createReview({
        productId: product.id,
        orderId: effectiveOrderId,
        rating,
        title: title.trim() || undefined,
        comment: message.trim(),
        photos: previewImages.length > 0 ? previewImages : undefined,
      });

      // Instant live feedback toast
      setSuccessToast('Thank you for your feedback! Your review is now live.');
      setIsSubmitted(true);

      if (onSubmitSuccess && res.review) {
        onSubmitSuccess(res.review);
      }

      setTimeout(() => {
        setIsSubmitted(false);
        setSuccessToast(null);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Write a Review</h3>
            <p className={styles.modalSubtitle}>
              Share your experience with <strong className={styles.productNameHighlight}>{product.name || 'this product'}</strong>.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Live Feedback Toast Notification */}
        {successToast && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#9F1239',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <CheckCircle2 size={40} />
            </div>
            <h4 className={styles.successTitle}>Thank You for Your Feedback!</h4>
            <p className={styles.successText}>
              Your review is now live on the storefront. We appreciate your honest opinion!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Star Rating Section */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Overall Rating *</label>
              </div>

              <div className={styles.starPickerContainer}>
                <div className={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= activeRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        className={styles.starBtn}
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={28}
                          fill={isFilled ? '#F99205' : 'transparent'}
                          color={isFilled ? '#F99205' : '#C2BEB6'}
                          strokeWidth={isFilled ? 0 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className={styles.ratingLabelBadge}>{RATING_LABELS[activeRating]}</span>
              </div>
            </div>

            {/* Review Title Input (Optional) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Review Title</label>
                <span className={styles.optionalBadge}>Optional</span>
              </div>
              <input
                type="text"
                className={styles.textarea}
                style={{ minHeight: '44px', height: '44px', padding: '0.5rem 0.75rem' }}
                placeholder="e.g., Best purchase for my pet this year!"
                value={title}
                maxLength={150}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Review Comment Textarea (Required, min 10 chars) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Your Review *</label>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: message.trim().length >= 10 ? '#2E7D32' : '#888276',
                  }}
                >
                  {message.trim().length}/10 min chars
                </span>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="Write your honest thoughts... (Minimum 10 characters. All genuine feedback goes live immediately!)"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Delivered Order Verification Field */}
            {!initialOrderId && (
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Verified Order ID *</label>
                  <span className={styles.optionalBadge}>Delivered Only</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className={styles.textarea}
                    style={{ minHeight: '44px', height: '44px', padding: '0.5rem 0.75rem' }}
                    placeholder="Enter delivered order ID (e.g., ORD-89241)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                  {checkingPurchaser && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <Loader2 size={16} className={styles.spinIcon} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photo / Image Upload Section (Optional, up to 5 photos) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Add Photos (Up to 5)</label>
                <span className={styles.optionalBadge}>Optional</span>
              </div>

              {/* Hidden File Input for Gallery */}
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />

              {/* Hidden File Input for Camera */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />

              <div
                className={`${styles.uploadOptionsContainer} ${isDragging ? styles.uploadDragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={styles.uploadOptionsRow}>
                  <button
                    type="button"
                    className={styles.uploadOptionBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      galleryInputRef.current?.click();
                    }}
                    disabled={isCompressing || previewImages.length >= 5}
                  >
                    <div className={styles.optionIconBadge}>
                      {isCompressing ? <Loader2 size={17} className={styles.spinIcon} /> : <ImageIcon size={17} />}
                    </div>
                    <div className={styles.optionTextGroup}>
                      <span className={styles.optionTitle}>
                        {isCompressing ? 'Processing...' : 'Upload Photos'}
                      </span>
                      <span className={styles.optionSub}>Drag & drop or browse</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.uploadOptionBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    disabled={isCompressing || previewImages.length >= 5}
                  >
                    <div className={styles.optionIconBadgeAlt}>
                      {isCompressing ? <Loader2 size={17} className={styles.spinIcon} /> : <Camera size={17} />}
                    </div>
                    <div className={styles.optionTextGroup}>
                      <span className={styles.optionTitle}>Take Photo</span>
                      <span className={styles.optionSub}>Use mobile camera</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Uploaded Thumbnail Previews */}
              {previewImages.length > 0 && (
                <div className={styles.thumbGrid}>
                  {previewImages.map((src, index) => (
                    <div key={index} className={styles.thumbItem}>
                      <Image
                        src={src}
                        alt={`Upload preview ${index + 1}`}
                        fill
                        sizes="72px"
                        className={styles.thumbImg}
                        unoptimized
                      />
                      <button
                        type="button"
                        className={styles.removeThumbBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || isCompressing || message.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className={styles.spinIcon} />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
