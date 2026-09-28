"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
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
  originalPrice?: number | null;
  stock: number;
  attributes?: Record<string, any> | null;
  imageUrl?: string | null;
  images?: string[];
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
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
  brand?: string;
  petSpecies?: string;
  dietaryPreference?: string;
  materials?: string;
  descriptionTitle?: string;
  description?: string;
  attributes?: Record<string, any>;
  highlights?: any;
  ingredients?: any;
  feedingGuide?: any;
  careInstructions?: string[];
  sizeGuide?: any;
  faqs?: Array<{ question: string; answer: string }>;
  variants?: ProductVariant[];
  media?: any[];
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

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const vars = product.variants;
      setSelectedVariant((prev) => {
        if (prev && vars.some((v) => v.id === prev.id)) {
          return prev;
        }
        return vars.find((v) => v.isDefault) || vars[0];
      });
    } else {
      setSelectedVariant(null);
    }
  }, [product.id, product.variants]);

  // Track product view in background
  useEffect(() => {
    if (product?.id) {
      userService.trackProductView(product.id, {
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice ?? undefined,
        rating: product.rating,
        imageUrl: product.image || (product.images && product.images[0]),
        stock: product.stock,
      });
    }
  }, [product]);

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
            <ProductGallery
              images={activeImages}
              productId={product.id}
              variantId={selectedVariant?.id}
              brand={product.brand || 'KickAt'}
            />
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

      {/* 3. Tabbed Content Section (Details & Highlights, Ingredients, Feeding, Safety, Shipping) */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductTabs product={product} />
        </div>
      </section>

      {/* 4. Product Details + Size Guide (2-Column Row) */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductSpecsAndSizeGuide product={product} />
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductReviews product={product} />
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductFAQ faqs={product.faqs} />
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
