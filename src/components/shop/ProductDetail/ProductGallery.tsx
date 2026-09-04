"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Play, Maximize, Heart, Share2 } from 'lucide-react';
import styles from './ProductDetail.module.css';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Ensure we have at least 5 thumbnail items for the strip (4 images + 1 video tile)
  const defaultImages = [
    images[0] || '/hero-products/dog_food.png',
    images[1] || '/hero-products/pet_bowl.png',
    images[2] || '/hero-products/pet_toy.png',
    '/hero-products/dog_food.png',
  ];

  const thumbnails = [
    { type: 'image', src: defaultImages[0] },
    { type: 'image', src: defaultImages[1] },
    { type: 'image', src: defaultImages[2] },
    { type: 'image', src: defaultImages[3] },
    { type: 'video', src: defaultImages[0] },
  ];

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

      {/* Large Main Image Box with Warm Background & Overlays */}
      <div className={styles.mainImageContainer}>
        {/* Top Text Overlay */}
        <div className={styles.mainImageTopOverlay}>
          <span className={styles.overlaySubtitle}>Natural &nbsp;|&nbsp; Safe &nbsp;|&nbsp; Premium Quality</span>
        </div>

        {/* Top Right Floating Actions: Wishlist (top) & Share (below) */}
        <div className={styles.imageTopRightActions}>
          <button
            type="button"
            className={`${styles.imageFloatingBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
            aria-label="Add to Wishlist"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart size={16} fill={isWishlisted ? "#FD802E" : "none"} color={isWishlisted ? "#FD802E" : "#211C15"} />
          </button>
          <button
            type="button"
            className={styles.imageFloatingBtn}
            aria-label="Share product"
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (navigator.share) {
                  navigator.share({ title: 'Check out this product', url: window.location.href }).catch(() => {});
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
            src={thumbnails[activeIndex]?.src || defaultImages[0]}
            alt="Product Image"
            fill
            className={styles.mainProductImage}
            priority
          />
          {thumbnails[activeIndex]?.type === 'video' && (
            <div className={styles.centerVideoPlayBtn}>
              <Play size={28} fill="#ffffff" color="#ffffff" />
            </div>
          )}
        </div>

        {/* Bottom Left Caption Bar */}
        <div className={styles.mainImageBottomCaption}>
          <span className={styles.captionBrandTitle}>MIM &amp; MATE</span>
          <span className={styles.captionBrandSub}>For a happier, healthier pet</span>
        </div>

        {/* Bottom Right Expand Button */}
        <button
          type="button"
          className={styles.expandZoomBtn}
          aria-label="Expand image"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.open(thumbnails[activeIndex]?.src, '_blank');
            }
          }}
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}
