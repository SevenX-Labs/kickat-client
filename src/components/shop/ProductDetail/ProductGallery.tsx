"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import styles from './ProductDetail.module.css';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.galleryWrapper}>
      {/* Thumbnails */}
      <div className={styles.thumbnailList}>
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`${styles.thumbnailBtn} ${idx === activeIndex ? styles.active : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`View image ${idx + 1}`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className={styles.thumbnailImage}
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className={styles.mainImageWrapper}>
        <Image
          src={images[activeIndex]}
          alt="Product Image"
          fill
          className={styles.mainImage}
          priority
        />
      </div>
    </div>
  );
}
