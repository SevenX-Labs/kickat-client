"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductTabs } from "./ProductTabs";
import { ProductSpecsAndSizeGuide } from "./ProductSpecsAndSizeGuide";
import { ProductReviews } from "./ProductReviews";
import { ProductFAQ } from "./ProductFAQ";
import { RelatedProducts } from "./RelatedProducts";
import { ProductDetailSkeleton } from "./ProductDetailSkeleton";
import { userService } from "@/services/userService";
import styles from "./ProductDetail.module.css";

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discountPrice?: number | null;
  stock: number;
  weightKg?: number | null;
  shippingWeightKg?: number | null;
  shippingLengthCm?: number | null;
  shippingBreadthCm?: number | null;
  shippingHeightCm?: number | null;
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
  categorySlug?: string;
  mainCategory: string;
  subCategory: string;
  brand?: string;
  petSpecies?: string;
  dietaryPreference?: string;
  materials?: string;
  descriptionTitle?: string;
  description?: string;
  shippingWeightKg?: number | null;
  shippingLengthCm?: number | null;
  shippingBreadthCm?: number | null;
  shippingHeightCm?: number | null;
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
  initialVariantId?: string;
}

export function ProductDetail({ product, isLoading, initialVariantId }: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlVariant = searchParams ? searchParams.get('variant') : null;
  const targetVariantId = urlVariant || initialVariantId;

  const findTargetVariant = (vars: ProductVariant[], targetId?: string | null) => {
    if (!vars || vars.length === 0) return null;
    if (targetId) {
      const match = vars.find(
        (v) => v.id === targetId || v.sku === targetId || v.name?.toLowerCase() === targetId.toLowerCase()
      );
      if (match) return match;
    }
    return vars.find((v) => v.isDefault) || vars[0];
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() =>
    product.variants && product.variants.length > 0
      ? findTargetVariant(product.variants, targetVariantId)
      : null
  );

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const vars = product.variants;
      const targetId = urlVariant || initialVariantId;
      if (targetId) {
        const match = vars.find(
          (v) => v.id === targetId || v.sku === targetId || v.name?.toLowerCase() === targetId.toLowerCase()
        );
        if (match) {
          setSelectedVariant(match);
          return;
        }
      }
      setSelectedVariant((prev) => {
        if (prev && vars.some((v) => v.id === prev.id)) {
          return prev;
        }
        return vars.find((v) => v.isDefault) || vars[0];
      });
    } else {
      setSelectedVariant(null);
    }
  }, [product.id, product.variants, urlVariant, initialVariantId]);

  const handleSelectVariant = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

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

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && document.referrer && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else if (product.categorySlug) {
      router.push(`/category/${product.categorySlug}`);
    } else {
      router.push('/category');
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Determine active images gallery
  const activeImages = (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : (selectedVariant && selectedVariant.imageUrl)
      ? [selectedVariant.imageUrl]
      : (product.images && product.images.length > 0)
        ? product.images
        : [product.image || '/hero-products/dog_food.png'];

  return (
    <div className={styles.pageContainer}>
      {/* Top Back Bar (Mobile View Only) */}
      <div className={styles.topBackBar}>
        <div className={styles.container}>
          <div className={styles.topBackNavRow}>
            <button
              type="button"
              onClick={handleBackNavigation}
              className={styles.backBtn}
              aria-label="Back to products list"
            >
              <ArrowLeft size={16} strokeWidth={2.4} />
              <span>Back to {product.mainCategory || 'Products'}</span>
            </button>
          </div>
        </div>
      </div>

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
              onSelectVariant={handleSelectVariant}
            />
          </div>
        </div>
      </section>

      {/* 3. Tabbed Content Section (Details & Highlights, Ingredients, Feeding, Safety, Shipping) */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductTabs product={product} selectedVariant={selectedVariant} />
        </div>
      </section>

      {/* 4. Product Details + Size Guide */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <ProductSpecsAndSizeGuide product={product} selectedVariant={selectedVariant} />
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

export default ProductDetail;
