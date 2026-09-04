"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HomeProductCard from '@/components/common/HomeProductCard/HomeProductCard';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';

interface RelatedProductsProps {
  currentProduct?: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  // Filter out current product & take top 4 related products
  const related = CATALOG_PRODUCTS.filter(
    (p) => !currentProduct || p.id !== currentProduct.id
  ).slice(0, 4);

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
