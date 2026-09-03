"use client";

import { ArrowRight } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { Product } from './ProductDetail';
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import ProductCard from '../../common/ProductCard/ProductCard';

interface RelatedProductsProps {
  currentProduct?: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  // If currentProduct is provided, filter by category. Otherwise just show first 4 products.
  const related = currentProduct 
    ? CATALOG_PRODUCTS.filter(p => p.mainCategory === currentProduct.mainCategory && p.id !== currentProduct.id).slice(0, 4)
    : CATALOG_PRODUCTS.slice(0, 4);

  const productsToDisplay = related;

  return (
    <div className={styles.relatedSectionWrapper}>
      <div className={styles.relatedHeader}>
        <div className={styles.relatedHeaderLeft}>
          <span className={styles.relatedEyebrow}>Pairs well with</span>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
        </div>
        <Link href="/shop" className={styles.viewAllLink}>
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div className={styles.relatedGrid}>
        {productsToDisplay.map(product => (
          <div key={product.id} className={styles.productCardWrapper}>
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>
    </div>
  );
}
