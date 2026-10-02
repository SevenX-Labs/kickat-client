"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import { useRouter } from 'next/navigation';
import { Play, Maximize, Heart, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();

  // Touch swipe support for mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const isWishlisted = productId ? checkIsWishlisted(productId, variantId) : false;

  const handleWishlistToggle = useCallback(async () => {
    if (!productId) return;

    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    await toggleWishlist({ id: productId, variantId }, variantId);
  }, [productId, variantId, isAuthenticated, router, toggleWishlist]);

  // Prioritize clean packaging / product shots as hero image (index 0), moving infographics/marketing banners secondary
  const sortedImages = useMemo(() => {
    const list = Array.isArray(images) && images.length > 0 ? [...images] : ['/hero-products/dog_food.png'];
    const isInfographic = (url: string) => {
      const lower = url.toLowerCase();
      return (
        lower.includes('infographic') ||
        lower.includes('guide') ||
        lower.includes('how_to') ||
        lower.includes('how-to') ||
        lower.includes('feeding') ||
        lower.includes('instruction') ||
        lower.includes('banner') ||
        lower.includes('chart')
      );
    };

    return list.sort((a, b) => {
      const aIsPromo = isInfographic(a);
      const bIsPromo = isInfographic(b);
      if (aIsPromo && !bIsPromo) return 1;
      if (!aIsPromo && bIsPromo) return -1;
      return 0;
    });
  }, [images]);

  // Reset activeIndex to 0 whenever images array changes
  useEffect(() => {
    setActiveIndex(0);
  }, [sortedImages, variantId]);

  const thumbnails = sortedImages.map((src) => ({
    type: 'image',
    src,
  }));

  const activeSrc = thumbnails[activeIndex]?.src || sortedImages[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : thumbnails.length - 1));
  }, [thumbnails.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < thumbnails.length - 1 ? prev + 1 : 0));
  }, [thumbnails.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe && activeIndex < thumbnails.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

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
              onMouseEnter={() => setActiveIndex(idx)}
              aria-label={`View image thumbnail ${idx + 1}`}
            >
              <SafeImage
                src={thumb.src}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className={styles.thumbnailImage}
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
      <div
        className={styles.mainImageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Right Floating Actions: Wishlist & Share */}
        <div className={styles.imageTopRightActions}>
          <button
            type="button"
            className={`${styles.imageFloatingBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={handleWishlistToggle}
          >
            <Heart
              size={18}
              fill={isWishlisted ? "#F99205" : "none"}
              color={isWishlisted ? "#F99205" : "#211C15"}
              className={isWishlisted ? styles.heartFilledIcon : ''}
            />
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
            <Share2 size={18} color="#211C15" />
          </button>
        </div>

        {/* Center Product Image Container with Instant Opacity Cross-fade */}
        <div className={styles.mainImageCenterWrap}>
          {thumbnails.map((thumb, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: idx === activeIndex ? 1 : 0,
                transition: 'opacity 0.15s ease-in-out',
                pointerEvents: idx === activeIndex ? 'auto' : 'none',
                zIndex: idx === activeIndex ? 2 : 1,
              }}
            >
              <SafeImage
                src={thumb.src}
                alt="Product Image"
                fill
                className={styles.mainProductImage}
                priority={idx === 0}
                loading="eager"
                sizes="(max-width: 768px) 100vw, 550px"
              />
            </div>
          ))}

          {thumbnails[activeIndex]?.type === 'video' && (
            <div className={styles.centerVideoPlayBtn}>
              <Play size={28} fill="#ffffff" color="#ffffff" />
            </div>
          )}
        </div>

        {/* Desktop / Tablet Nav Arrows when multiple images */}
        {thumbnails.length > 1 && (
          <div className={styles.galleryNavArrows}>
            <button
              type="button"
              onClick={handlePrev}
              className={styles.galleryArrowBtn}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={styles.galleryArrowBtn}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Mobile & Desktop Image Counter Pill */}
        {thumbnails.length > 1 && (
          <div className={styles.imageCounterPill}>
            <span>{activeIndex + 1} / {thumbnails.length}</span>
          </div>
        )}

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
              <SafeImage
                src={activeSrc}
                alt="Enlarged Product View"
                fill
                className={styles.lightboxImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
