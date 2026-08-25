"use client";

import styles from './ProductDetail.module.css';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTabs } from './ProductTabs';
import { ProductReviews } from './ProductReviews';
import { RelatedProducts } from './RelatedProducts';
import Link from 'next/link';

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
  // Format category names for display (e.g., 'dogs' -> 'Dogs')
  const mainCategoryName = product.mainCategory.charAt(0).toUpperCase() + product.mainCategory.slice(1);
  const subCategoryName = product.subCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumbs */}
      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href={`/categories/${product.mainCategory}`} className={styles.breadcrumbLink}>{mainCategoryName}</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href={`/category/${product.mainCategory}/${product.subCategory}`} className={styles.breadcrumbLink}>{subCategoryName}</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>
      </div>

      {/* Top Section: Gallery + Info */}
      <section className={styles.topSection}>
        <div className={styles.container}>
          <div className={styles.productLayout}>
            <ProductGallery images={product.images} />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      {/* Middle Section: Tabs */}
      <section className={styles.tabsSection}>
        <div className={styles.container}>
          <ProductTabs product={product} />
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.reviewsSectionWrapper}>
        <div className={styles.container}>
          <ProductReviews product={product} />
        </div>
      </section>

      {/* Bottom Section: Related Products */}
      <section className={styles.relatedSection}>
        <div className={styles.container}>
          <RelatedProducts currentProduct={product} />
        </div>
      </section>
    </div>
  );
}
