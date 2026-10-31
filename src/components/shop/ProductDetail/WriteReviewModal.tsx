"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  X,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Truck,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import styles from "./WriteReviewModal.module.css";
import { Product } from "./ProductDetail";
import { useAuth } from "@/context/AuthContext";
import { reviewService } from "@/services/reviewService";
import { ReviewItem, ReviewEligibilityResponse } from "@/types/review";

interface WriteReviewModalProps {
  product: Product;
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (review: ReviewItem) => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "5.0 - Excellent",
  4: "4.0 - Good",
  3: "3.0 - Average",
  2: "2.0 - Poor",
  1: "1.0 - Terrible",
};

/**
 * Utility function to compress images client-side to WebP format under 2MB.
 */
async function compressImageToWebP(file: File, maxSizeBytes: number = 2 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Failed to load image"));
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

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/webp", quality);

        const calculateByteSize = (url: string) => {
          const base64Length = url.length - (url.indexOf(",") + 1);
          return Math.round((base64Length * 3) / 4);
        };

        while (calculateByteSize(dataUrl) > maxSizeBytes && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/webp", quality);
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
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Verification state
  const [checkingEligibility, setCheckingEligibility] = useState<boolean>(false);
  const [eligibility, setEligibility] = useState<ReviewEligibilityResponse | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check review eligibility on open
  useEffect(() => {
    if (!isOpen) return;

    if (!isAuthenticated) {
      setEligibility({
        success: true,
        canReview: false,
        reason: "NOT_PURCHASED",
        message: "Please log in to write a review. Only verified purchasers can review this product.",
      });
      return;
    }

    const verifyPurchaser = async () => {
      setCheckingEligibility(true);
      setErrorMessage(null);
      try {
        const res = await reviewService.checkEligibility(product.id);
        setEligibility(res);
      } catch (err: unknown) {
        console.warn("Could not verify review eligibility:", err);
        if (initialOrderId) {
          setEligibility({
            success: true,
            canReview: true,
            orderId: initialOrderId,
          });
        } else {
          setEligibility({
            success: true,
            canReview: false,
            reason: "NOT_PURCHASED",
            message: "Only verified purchasers who have ordered and received this product can write a review.",
          });
        }
      } finally {
        setCheckingEligibility(false);
      }
    };

    verifyPurchaser();
  }, [isOpen, isAuthenticated, product.id, initialOrderId]);

  if (!isOpen) return null;

  const processAndAddFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    if (previewImages.length + validFiles.length > 5) {
      setErrorMessage("You can upload up to 5 photos per review.");
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
      console.error("Image processing failed:", err);
      setErrorMessage("Failed to process image. Please try another file.");
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
      if (inputElement) inputElement.value = "";
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setPreviewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!message || message.trim().length < 10) {
      setErrorMessage("Please write at least 10 characters sharing your honest feedback.");
      return;
    }

    if (!isAuthenticated) {
      setErrorMessage("Please log in to submit a verified purchase review.");
      return;
    }

    setIsSubmitting(true);

    const validPhotoUrls = previewImages.filter((img) =>
      /^https?:\/\//i.test(img)
    );

    try {
      const res = await reviewService.createReview({
        productId: product.id,
        orderId: eligibility?.orderId || initialOrderId || undefined,
        rating,
        title: title.trim() || undefined,
        comment: message.trim(),
        photos: validPhotoUrls.length > 0 ? validPhotoUrls : undefined,
      });

      setSuccessToast("Thank you for your feedback! Your review is now live.");
      setIsSubmitted(true);

      if (onSubmitSuccess && res.review) {
        onSubmitSuccess(res.review);
      }

      setTimeout(() => {
        setIsSubmitted(false);
        setSuccessToast(null);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review. Please try again.";
      setErrorMessage(msg);
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
              Share your experience with <strong className={styles.productNameHighlight}>{product.name || "this product"}</strong>.
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
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#065F46",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              fontSize: "0.825rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div
            style={{
              background: "#FFF1F2",
              border: "1px solid #FECDD3",
              color: "#BE123C",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              fontSize: "0.825rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Checking Eligibility Loader */}
        {checkingEligibility && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 1rem", gap: "0.75rem", textAlign: "center" }}>
            <Loader2 size={32} className={styles.spinIcon} style={{ color: "#F99205" }} />
            <p style={{ fontSize: "0.85rem", color: "#666055", fontWeight: 600, margin: 0 }}>
              Verifying delivered purchase status...
            </p>
          </div>
        )}

        {/* Not Authenticated State */}
        {!checkingEligibility && !isAuthenticated && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", gap: "0.85rem", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#FFF7EE", display: "flex", alignItems: "center", justifyContent: "center", color: "#F99205" }}>
              <ShoppingBag size={28} />
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1A1612", margin: 0 }}>
              Sign In to Write a Review
            </h4>
            <p style={{ fontSize: "0.825rem", color: "#78746D", lineHeight: 1.5, margin: 0, maxWidth: "340px" }}>
              Only verified purchasers who have ordered and received this item can write a review. Please sign in to verify your purchase.
            </p>
            <Link
              href="/login"
              style={{
                marginTop: "0.5rem",
                background: "#F99205",
                color: "#ffffff",
                padding: "0.65rem 1.5rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign In / Register
            </Link>
          </div>
        )}

        {/* Authenticated but Not Eligible */}
        {!checkingEligibility && isAuthenticated && eligibility && !eligibility.canReview && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", gap: "0.85rem", textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: eligibility.reason === "ALREADY_REVIEWED" ? "#E8F5E9" : "#FFF7EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: eligibility.reason === "ALREADY_REVIEWED" ? "#2E7D32" : "#F99205",
              }}
            >
              {eligibility.reason === "ALREADY_REVIEWED" ? (
                <CheckCircle2 size={28} />
              ) : eligibility.reason === "NOT_DELIVERED" ? (
                <Truck size={28} />
              ) : (
                <ShoppingBag size={28} />
              )}
            </div>

            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1A1612", margin: 0 }}>
              {eligibility.reason === "ALREADY_REVIEWED"
                ? "Review Already Submitted"
                : eligibility.reason === "NOT_DELIVERED"
                ? "Order Not Delivered Yet"
                : "Verified Purchase Required"}
            </h4>

            <p style={{ fontSize: "0.825rem", color: "#78746D", lineHeight: 1.5, margin: 0, maxWidth: "340px" }}>
              {eligibility.message ||
                "Only customers who have ordered and received this product can write a review."}
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Link
                href="/orders"
                style={{
                  background: "#F99205",
                  color: "#ffffff",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "12px",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                View My Orders
              </Link>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelBtn}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Successfully Submitted View */}
        {isSubmitted && (
          <div className={styles.successStateContainer}>
            <div className={styles.successBadgeCircle}>
              <CheckCircle2 size={40} className={styles.successIcon} />
            </div>
            <h4 className={styles.successTitle}>Review Submitted!</h4>
            <p className={styles.successMessage}>
              Thank you for sharing your genuine experience!
            </p>
          </div>
        )}

        {/* Main Review Form (Shown only when Verified & Eligible) */}
        {!checkingEligibility && isAuthenticated && eligibility?.canReview && !isSubmitted && (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Verified Buyer Badge Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "#E8F5E9",
                border: "1px solid #C8E6C9",
                padding: "0.65rem 0.9rem",
                borderRadius: "12px",
                fontSize: "0.8rem",
                color: "#2E7D32",
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
              <span>
                Verified Purchase {eligibility.orderNumber ? `• Order #${eligibility.orderNumber}` : ""} (Delivered)
              </span>
            </div>

            {/* Star Rating Select */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Overall Rating *</label>
                <span className={styles.ratingLabelBadge}>{RATING_LABELS[activeRating]}</span>
              </div>
              <div className={styles.starRow}>
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    className={styles.starPickBtn}
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${starVal} out of 5 stars`}
                  >
                    <Star
                      size={28}
                      fill={starVal <= activeRating ? "#F99205" : "transparent"}
                      color={starVal <= activeRating ? "#F99205" : "#D1D5DB"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title Input (Optional, max 200 chars) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Headline / Title</label>
                <span className={styles.optionalBadge}>Optional</span>
              </div>
              <input
                type="text"
                className={styles.textarea}
                style={{ minHeight: "44px", height: "44px", padding: "0.5rem 0.75rem" }}
                placeholder="e.g., Best purchase for my pet this year!"
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Review Comment Textarea (Required, min 10 chars) */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Your Review *</label>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: message.trim().length >= 10 ? "#2E7D32" : "#888276",
                  }}
                >
                  {message.trim().length}/10 min chars
                </span>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="Write your honest thoughts... (Minimum 10 characters)"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Photo Upload Section */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Add Photos (Up to 5)</label>
                <span className={styles.optionalBadge}>Optional</span>
              </div>

              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              <div
                className={`${styles.uploadOptionsContainer} ${isDragging ? styles.uploadDragging : ""}`}
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
                        {isCompressing ? "Processing..." : "Upload Photos"}
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
                <div className={styles.thumbnailsRow}>
                  {previewImages.map((src, idx) => (
                    <div key={idx} className={styles.thumbnailWrap}>
                      <Image
                        src={src}
                        alt={`Review preview ${idx + 1}`}
                        fill
                        className={styles.thumbnailImg}
                        unoptimized={src.startsWith("data:")}
                      />
                      <button
                        type="button"
                        className={styles.removeThumbnailBtn}
                        onClick={() => removeImage(idx)}
                        aria-label="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || message.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className={styles.spinIcon} />
                    <span>Submitting...</span>
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
