"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/SafeImage';
import { useRouter } from 'next/navigation';
import { Play, Maximize, Heart, Share2, X, Loader2 } from 'lucide-react';
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
  const wishlistLoadingRef = useRef(false);
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

    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/shop';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (wishlistLoadingRef.current) return;
    wishlistLoadingRef.current = true;

    const nextWishlisted = !isWishlisted;

    // Instant optimistic update for immediate visual feedback
    setIsWishlisted(nextWishlisted);

    try {
      if (nextWishlisted) {
        await wishlistService.addToWishlist(productId, variantId);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId, action: 'add' } }));
        }
      } else {
        await wishlistService.removeFromWishlist(productId, variantId);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId, action: 'remove' } }));
        }
      }
    } catch (err: any) {
      console.error('Failed to update wishlist:', err);
      // Revert state if request fails
      setIsWishlisted(!nextWishlisted);
    } finally {
      wishlistLoadingRef.current = false;
    }
  }, [productId, variantId, isWishlisted, isAuthenticated, router]);

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

  // Reset activeIndex to 0 whenever images array changes (e.g. when variant selection changes)
  useEffect(() => {
    setActiveIndex(0);
  }, [sortedImages, variantId]);

  const thumbnails = sortedImages.map((src) => ({
    type: 'image',
    src,
  }));

  const activeSrc = thumbnails[activeIndex]?.src || sortedImages[0];

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

      {/* Large Main Image Box (Clean, without intrusive overlay labels covering product art) */}
      <div className={styles.mainImageContainer}>
        {/* Top Right Floating Actions: Wishlist & Share */}
        <div className={styles.imageTopRightActions}>
          <button
            type="button"
            className={`${styles.imageFloatingBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={handleWishlistToggle}
            
          >
            <Heart size={16} fill={isWishlisted ? "#F99205" : "none"} color={isWishlisted ? "#F99205" : "#211C15"} />
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

        {/* Center Product Image Container with Instant Opacity Cross-fade Pre-rendering */}
        <div className={styles.mainImageCenterWrap}>
          {thumbnails.map((thumb, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: idx === activeIndex ? 1 : 0,
                transition: 'opacity 0.12s ease-in-out',
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
                loading={idx === 0 ? 'eager' : 'eager'}
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
