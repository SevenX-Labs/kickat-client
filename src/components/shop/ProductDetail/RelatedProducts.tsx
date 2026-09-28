"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import HomeProductCard from '@/components/common/HomeProductCard/HomeProductCard';
import { productService } from '@/services/productService';
import { mapBackendProductListToCards } from '@/types/product';
import styles from './RelatedProducts.module.css';
import { Product } from './ProductDetail';

interface RelatedProductsProps {
  currentProduct?: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const dedupeCards = (cards: any[]) => {
          const seen = new Set<string>();
          return cards.filter((c) => {
            if (!c || !c.id) return false;
            const key = c.variantId
              ? `${c.id}-${c.variantId}`
              : `${c.id}-${(c.variantName || c.name || 'base').trim().toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };

        if (currentProduct?.id) {
          // Product detail page context: fetch related products
          const res = await productService.getRelatedProducts(currentProduct.id, 6);
          if (isMounted && res.success && Array.isArray(res.relatedProducts)) {
            const filtered = res.relatedProducts.filter((p) => p.id !== currentProduct.id);
            const mapped = mapBackendProductListToCards(filtered);
            setRelated(dedupeCards(mapped).slice(0, 4));
          }
        } else {
          // Cart page context: fetch live trending / best-sellers
          const res = await productService.getTrending(6);
          if (isMounted && res.success && Array.isArray(res.products)) {
            const mapped = mapBackendProductListToCards(res.products);
            setRelated(dedupeCards(mapped).slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Failed to load related products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [currentProduct?.id]);

  if (!loading && related.length === 0) {
    return null;
  }

  return (
    <div className={styles.relatedProductsWrapper}>
      <div className={styles.relatedProductsHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>
            <Sparkles size={13} />
            {currentProduct?.id ? "Similar Essentials" : "Curated for You"}
          </span>
          <h2 className={styles.relatedProductsTitle}>
            {currentProduct?.id ? "You May Also Like" : "Recommended for your Cart"}
          </h2>
          <p className={styles.subtitle}>
            Popular veterinarian-approved treats, formulas, and grooming care.
          </p>
        </div>
        <Link href="/categories" className={styles.viewAllOrangeLink}>
          <span>View All Products</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className={styles.relatedProductsGrid}>
        {related.map((prod) => (
          <HomeProductCard key={prod.variantId ? `${prod.id}-${prod.variantId}` : prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
