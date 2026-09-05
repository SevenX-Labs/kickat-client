"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Star, X, CheckCircle2, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import styles from './WriteReviewModal.module.css';
import { Product } from './ProductDetail';

interface WriteReviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (reviewData: { rating: number; message: string; photos: string[] }) => void;
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

        // Iteratively lower quality if still over target max byte size
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

export function WriteReviewModal({ product, isOpen, onClose, onSubmitSuccess }: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processAndAddFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setIsCompressing(true);
    try {
      const compressedWebpUrls = await Promise.all(
        validFiles.map((file) => compressImageToWebP(file, 2 * 1024 * 1024))
      );
      setPreviewImages((prev) => [...prev, ...compressedWebpUrls]);
    } catch (err) {
      console.error('Image compression failed:', err);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onSubmitSuccess) {
      onSubmitSuccess({ rating, message, photos: previewImages });
    }
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1600);
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

        {isSubmitted ? (
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <CheckCircle2 size={36} />
            </div>
            <h4 className={styles.successTitle}>Thank You for Your Review!</h4>
            <p className={styles.successText}>Your rating and feedback have been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* Star Rating Section */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Overall Rating</label>
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
                          fill={isFilled ? '#FD802E' : 'transparent'}
                          color={isFilled ? '#FD802E' : '#C2BEB6'}
                          strokeWidth={isFilled ? 0 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className={styles.ratingLabelBadge}>{RATING_LABELS[activeRating]}</span>
              </div>
            </div>

            {/* Review Message Textarea (Optional) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Your Message</label>
                <span className={styles.optionalBadge}>Optional</span>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="Write your review here..."
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Photo / Image Upload Section (Optional) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Add Photos</label>
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
                    disabled={isCompressing}
                  >
                    <div className={styles.optionIconBadge}>
                      {isCompressing ? <Loader2 size={17} className={styles.spinIcon} /> : <ImageIcon size={17} />}
                    </div>
                    <div className={styles.optionTextGroup}>
                      <span className={styles.optionTitle}>
                        {isCompressing ? 'Processing...' : 'Upload from Gallery'}
                      </span>
                      <span className={styles.optionSub}>Select from device</span>
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
                    disabled={isCompressing}
                  >
                    <div className={styles.optionIconBadgeAlt}>
                      {isCompressing ? <Loader2 size={17} className={styles.spinIcon} /> : <Camera size={17} />}
                    </div>
                    <div className={styles.optionTextGroup}>
                      <span className={styles.optionTitle}>
                        {isCompressing ? 'Processing...' : 'Take a Photo'}
                      </span>
                      <span className={styles.optionSub}>Use device camera</span>
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
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isCompressing}>
                Submit Review
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
