"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const DEFAULT_FALLBACK = '/hero-products/dog_food.png';
const SECONDARY_FALLBACK = '/hero-products/pet_bowl.png';
// Ultimate SVG fallback if static assets ever fail to resolve
const SVG_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23F3F4F6"/><path d="M35 40a5 5 0 100-10 5 5 0 000 10zm30 0a5 5 0 100-10 5 5 0 000 10zM50 65c8 0 14-6 14-12H36c0 6 6 12 14 12z" fill="%23D1D5DB"/></svg>';

export function getProductFallbackImage(name?: string, category?: string, petSpecies?: string): string {
  const combined = `${name || ''} ${category || ''} ${petSpecies || ''}`.toLowerCase();
  
  if (combined.includes('cat') || combined.includes('kitten')) {
    return '/hero-products/cat_treats.png';
  }
  if (combined.includes('bowl') || combined.includes('feeder') || combined.includes('dish')) {
    return '/hero-products/pet_bowl.png';
  }
  if (combined.includes('toy') || combined.includes('ball') || combined.includes('chew')) {
    return '/hero-products/pet_toy.png';
  }
  if (combined.includes('fish') || combined.includes('aquarium')) {
    return '/category-images/fish.png';
  }
  if (combined.includes('bird')) {
    return '/category-images/bird.png';
  }
  return DEFAULT_FALLBACK;
}

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  productName?: string;
  categoryName?: string;
  petSpecies?: string;
}

export function SafeImage({
  src,
  fallbackSrc,
  productName,
  categoryName,
  petSpecies,
  alt = 'Product Image',
  unoptimized,
  ...props
}: SafeImageProps) {
  const smartFallback = fallbackSrc || getProductFallbackImage(productName, categoryName, petSpecies);

  const getValidInitialSrc = (url?: string | null) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return smartFallback;
    }
    return url.trim();
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => getValidInitialSrc(src));
  const [errorLevel, setErrorLevel] = useState<number>(0);

  // Sync if src or fallback changes
  useEffect(() => {
    const valid = getValidInitialSrc(src);
    setCurrentSrc(valid);
    setErrorLevel(0);
  }, [src, smartFallback]);

  const handleError = () => {
    if (errorLevel === 0) {
      setErrorLevel(1);
      setCurrentSrc(smartFallback);
    } else if (errorLevel === 1) {
      setErrorLevel(2);
      setCurrentSrc(smartFallback === DEFAULT_FALLBACK ? SECONDARY_FALLBACK : DEFAULT_FALLBACK);
    } else if (errorLevel === 2) {
      setErrorLevel(3);
      setCurrentSrc(SVG_FALLBACK);
    }
  };

  const isUnoptimized =
    unoptimized ||
    currentSrc.startsWith('data:') ||
    currentSrc.startsWith('blob:') ||
    (!currentSrc.startsWith('http://') && !currentSrc.startsWith('https://') && !currentSrc.startsWith('/'));

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
      unoptimized={isUnoptimized}
    />
  );
}

export default SafeImage;
