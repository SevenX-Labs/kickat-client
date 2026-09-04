"use client";

import Link from 'next/link';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTrustStrip } from './ProductTrustStrip';
import { ProductTabs } from './ProductTabs';
import { ProductSpecsAndSizeGuide } from './ProductSpecsAndSizeGuide';
import { ProductReviews } from './ProductReviews';
import { ProductFAQ } from './ProductFAQ';
import { RelatedProducts } from './RelatedProducts';
import styles from './ProductDetail.module.css';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
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
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className={styles.pageContainer}>

      {/* 1. Main Product Section (2-Column Desktop, Stacked Mobile) */}
      <section className={styles.mainProductSection}>
        <div className={styles.container}>
          <div className={styles.mainProductGrid}>
            <ProductGallery images={product.images} />
            <ProductInfo product={product} />
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
