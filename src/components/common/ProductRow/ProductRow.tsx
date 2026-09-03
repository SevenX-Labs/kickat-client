"use client";

import { PawPrint, ArrowRight } from 'lucide-react';
import styles from './ProductRow.module.css';
import ProductCard from '../ProductCard/ProductCard';
import { CatalogProduct } from '@/data/categoryData';

type Product = CatalogProduct;

export interface ProductRowProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: 'cream' | 'white';
}



export function ProductRow({ eyebrow, title, subtitle, products, viewAllLink = '/shop', backgroundColor = 'cream' }: ProductRowProps) {
  const displayProducts = products.slice(0, 4);
  const bgClass = backgroundColor === 'white' ? styles.bgWhite : styles.bgCream;

  return (
    <section className={`${styles.sectionWrapper} ${bgClass}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrowWrapper}>
              {eyebrow.toUpperCase().includes('CROWD') && <PawPrint size={14} fill="currentColor" strokeWidth={0} />}
              <span className={styles.eyebrow}>{eyebrow}</span>
            </div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {!subtitle && eyebrow.toUpperCase().includes('CROWD') && (
              <p className={styles.subtitle}>Handpicked essentials that pets love and pet parents trust.</p>
            )}
          </div>
          <Link href={viewAllLink} className={styles.viewAllBtn}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {displayProducts.map(product => (
            <div key={product.id} className={styles.productCardWrapper}>
              <ProductCard product={product as any} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
