"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTrustStrip } from './ProductTrustStrip';
import { ProductTabs } from './ProductTabs';
import { ProductSpecsAndSizeGuide } from './ProductSpecsAndSizeGuide';
import { ProductReviews } from './ProductReviews';
import { ProductFAQ } from './ProductFAQ';
import { RelatedProducts } from './RelatedProducts';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import styles from './ProductDetail.module.css';

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  attributes?: Record<string, string>;
  imageUrl?: string | null;
  images?: string[];
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  type?: "SIMPLE" | "VARIABLE";
  price: number;
  originalPrice?: number;
  discountPrice?: number | null;
  stock?: number;
  badge?: string;
  rating: number;
  reviewsCount?: number;
  image: string;
  images: string[];
  mainCategory: string;
  subCategory: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  description?: string;
  variants?: ProductVariant[];
}

interface ProductDetailProps {
  product: Product;
  isLoading?: boolean;
}

export function ProductDetail({ product, isLoading }: ProductDetailProps) {
  // Determine default variant if product is variable
  const defaultVar = product.variants && product.variants.length > 0
    ? (product.variants.find((v) => v.isDefault) || product.variants[0])
    : null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVar);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Determine active images gallery: if selected variant has images, use it, else fallback to parent product images
  const activeImages = (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : (selectedVariant && selectedVariant.imageUrl)
      ? [selectedVariant.imageUrl]
      : (product.images && product.images.length > 0)
        ? product.images
        : [product.image || '/hero-products/dog_food.png'];

  return (
    <div className={styles.pageContainer}>

      {/* 1. Main Product Section (2-Column Desktop, Stacked Mobile) */}
      <section className={styles.mainProductSection}>
        <div className={styles.container}>
          <div className={styles.mainProductGrid}>
            <ProductGallery images={activeImages} />
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          </div>
        </div>
      </section>

      {/* 2. Trust Strip Band */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductTrustStrip />
        </div>
      </section>

      {/* 3. Tabbed Content Section (Details, Materials, Size & Fit, Shipping & Returns) */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductTabs product={product} />
        </div>
      </section>

      {/* 4. Product Details + Size Guide (2-Column Row) */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductSpecsAndSizeGuide />
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductReviews product={product} />
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) Section - Below Customer Reviews */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductFAQ />
        </div>
      </section>

      {/* 7. "You may also like" Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <RelatedProducts currentProduct={product} />
        </div>
      </section>
    </div>
  );
}
