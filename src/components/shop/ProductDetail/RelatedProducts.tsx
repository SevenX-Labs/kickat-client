"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HomeProductCard from '@/components/common/HomeProductCard/HomeProductCard';
import { productService } from '@/services/productService';
import { mapBackendProductToCard } from '@/types/product';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface RelatedProductsProps {
  currentProduct?: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentProduct?.id) return;
    let isMounted = true;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await productService.getRelatedProducts(currentProduct.id, 4);
        if (isMounted && res.success && Array.isArray(res.relatedProducts)) {
          const mapped = res.relatedProducts
            .filter((p) => p.id !== currentProduct.id)
            .map(mapBackendProductToCard);
          setRelated(mapped);
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
        <h2 className={styles.relatedProductsTitle}>You may also like</h2>
        <Link href="/category" className={styles.viewAllOrangeLink}>
          <span>View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.relatedProductsGrid}>
        {related.map((prod) => (
          <HomeProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
