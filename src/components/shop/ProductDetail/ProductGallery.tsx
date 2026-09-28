"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Maximize, Heart, Share2, X, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { wishlistService } from '@/services/wishlistService';
import styles from './ProductDetail.module.css';

interface ProductGalleryProps {
  images: string[];
  productId?: string;
  variantId?: string;
  brand?: string;
}

export function ProductGallery({ images, productId, variantId, brand = 'KickAt' }: ProductGalleryProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Sync wishlist status
  useEffect(() => {
    if (!productId) return;
    const handleWishlistUpdated = (e: any) => {
      if (e.detail?.productId === productId) {
        setIsWishlisted(e.detail.action === 'add');
      }
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [productId]);

  const handleWishlistToggle = useCallback(async () => {
    if (!productId) {
      setIsWishlisted((prev) => !prev);
      return;
    }

    if (isWishlistLoading) return;

    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsWishlistLoading(true);
    if (!isWishlisted) {
      try {
        await wishlistService.addToWishlist(productId, variantId);
        setIsWishlisted(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId, action: 'add' } }));
        }
      } catch (err: any) {
        console.error('Failed to add to wishlist:', err);
      } finally {
        setIsWishlistLoading(false);
      }
    } else {
      try {
        await wishlistService.removeFromWishlist(productId, variantId);
        setIsWishlisted(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId, action: 'remove' } }));
        }
      } catch (err: any) {
        console.error('Failed to remove from wishlist:', err);
      } finally {
        setIsWishlistLoading(false);
      }
    }
  }, [productId, variantId, isWishlisted, isWishlistLoading, isAuthenticated, router]);

  // Reset activeIndex to 0 whenever images array changes (e.g. when variant selection changes)
  const currentImages = Array.isArray(images) && images.length > 0 ? images : ['/hero-products/dog_food.png'];
  
  const thumbnails = currentImages.map((src) => ({
    type: 'image',
    src,
  }));

  const activeSrc = thumbnails[activeIndex]?.src || currentImages[0];

  return (
    <div className={styles.galleryWrapper}>
      {/* Vertical Thumbnail Strip (Far Left on Desktop) */}
      <div className={styles.thumbnailList}>
        {thumbnails.map((thumb, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              type="button"
              className={`${styles.thumbnailBtn} ${isActive ? styles.thumbnailActive : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image thumbnail ${idx + 1}`}
            >
              <Image
                src={thumb.src}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className={styles.thumbnailImage}
                unoptimized={thumb.src.startsWith('data:')}
              />
              {thumb.type === 'video' && (
                <div className={styles.videoPlayOverlay}>
                  <Play size={14} fill="#ffffff" color="#ffffff" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Large Main Image Box */}
      <div className={styles.mainImageContainer}>
        {/* Top Feature Tag */}
        <div className={styles.mainImageTopOverlay}>
          <span className={styles.overlaySubtitle}>
            100% Pet-Safe &nbsp;|&nbsp; Premium Quality
          </span>
        </div>

        {/* Top Right Floating Actions: Wishlist & Share */}
        <div className={styles.imageTopRightActions}>
          <button
            type="button"
            className={`${styles.imageFloatingBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <Loader2 size={16} className="animate-spin" color="#F99205" />
            ) : (
              <Heart size={16} fill={isWishlisted ? "#F99205" : "none"} color={isWishlisted ? "#F99205" : "#211C15"} />
            )}
          </button>
          <button
            type="button"
            className={styles.imageFloatingBtn}
            aria-label="Share product"
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (navigator.share) {
                  navigator.share({ title: 'Check out this product on KickAt', url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }
            }}
          >
            <Share2 size={16} color="#211C15" />
          </button>
        </div>

        {/* Center Product Image */}
        <div className={styles.mainImageCenterWrap}>
          <Image
            src={activeSrc}
            alt="Product Image"
            fill
            className={styles.mainProductImage}
            priority
            unoptimized={activeSrc.startsWith('data:')}
          />
          {thumbnails[activeIndex]?.type === 'video' && (
            <div className={styles.centerVideoPlayBtn}>
              <Play size={28} fill="#ffffff" color="#ffffff" />
            </div>
          )}
        </div>

        {/* Bottom Left Caption Bar */}
        <div className={styles.mainImageBottomCaption}>
          <span className={styles.captionBrandTitle}>{brand.toUpperCase()}</span>
          <span className={styles.captionBrandSub}>For a happier, healthier companion</span>
        </div>

        {/* Bottom Right Expand Button */}
        <button
          type="button"
          className={styles.expandZoomBtn}
          aria-label="Expand image view"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* In-Page Lightbox Modal */}
      {isLightboxOpen && (
        <div className={styles.lightboxModalBackdrop} onClick={() => setIsLightboxOpen(false)}>
          <div className={styles.lightboxModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close expanded view"
            >
              <X size={20} />
            </button>
            <div className={styles.lightboxImageWrap}>
              <Image
                src={activeSrc}
                alt="Enlarged Product View"
                fill
                className={styles.lightboxImage}
                unoptimized={activeSrc.startsWith('data:')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
