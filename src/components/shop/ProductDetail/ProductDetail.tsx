"use client";

import Link from 'next/link';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTrustStrip } from './ProductTrustStrip';
import { ProductTabs } from './ProductTabs';
import { ProductSpecsAndSizeGuide } from './ProductSpecsAndSizeGuide';
import { ProductReviews } from './ProductReviews';
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
  const mainCategoryName =
    product.mainCategory.charAt(0).toUpperCase() + product.mainCategory.slice(1);
  const subCategoryName = product.subCategory
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumbs Header */}
      <div className={styles.container}>
        <nav className={styles.breadcrumbsNav} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <Link href={`/category/${product.mainCategory}`} className={styles.breadcrumbLink}>{mainCategoryName}</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <Link href={`/category/${product.mainCategory}/${product.subCategory}`} className={styles.breadcrumbLink}>{subCategoryName}</Link>
          <span className={styles.breadcrumbDivider}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>
      </div>

      {/* 2. Main Product Section (2-Column Desktop, Stacked Mobile) */}
      <section className={styles.mainProductSection}>
        <div className={styles.container}>
          <div className={styles.mainProductGrid}>
            <ProductGallery images={product.images} />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      {/* 3. Trust Strip Band */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductTrustStrip />
        </div>
      </section>

      {/* 4. Tabbed Content Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductTabs product={product} />
        </div>
      </section>

      {/* 5. Product Details + Size Guide (2-Column Row) */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductSpecsAndSizeGuide />
        </div>
      </section>

      {/* 6. Customer Reviews Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductReviews product={product} />
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
