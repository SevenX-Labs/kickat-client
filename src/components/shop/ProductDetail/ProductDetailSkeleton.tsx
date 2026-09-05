"use client";

import styles from "./ProductDetailSkeleton.module.css";

export function ProductDetailSkeleton() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        
        {/* Breadcrumb Skeleton */}
        <div className={styles.breadcrumbsSkeleton}>
          <div className={`${styles.shimmer} ${styles.breadcrumbPill}`} />
          <span>/</span>
          <div className={`${styles.shimmer} ${styles.breadcrumbPill}`} />
          <span>/</span>
          <div className={`${styles.shimmer} ${styles.breadcrumbPill}`} style={{ width: '100px' }} />
        </div>

        {/* Main Product Grid Skeleton */}
        <div className={styles.mainGrid}>
          
          {/* Left: Gallery Skeleton */}
          <div className={styles.galleryWrapper}>
            <div className={styles.thumbnailCol}>
              <div className={`${styles.shimmer} ${styles.thumbnailBox}`} />
              <div className={`${styles.shimmer} ${styles.thumbnailBox}`} />
              <div className={`${styles.shimmer} ${styles.thumbnailBox}`} />
              <div className={`${styles.shimmer} ${styles.thumbnailBox}`} />
            </div>
            <div className={`${styles.shimmer} ${styles.mainImageBox}`} />
          </div>

          {/* Right: Info Skeleton */}
          <div className={styles.infoCol}>
            <div className={`${styles.shimmer} ${styles.categoryBadge}`} />
            
            <div className={`${styles.shimmer} ${styles.titleLine1}`} />
            <div className={`${styles.shimmer} ${styles.titleLine2}`} />

            <div className={styles.ratingRow}>
              <div className={`${styles.shimmer} ${styles.starsBox}`} />
              <div className={`${styles.shimmer} ${styles.reviewsBox}`} />
            </div>

            <div className={`${styles.shimmer} ${styles.priceBox}`} />

            <div className={styles.optionsBlock}>
              <div className={`${styles.shimmer} ${styles.optionLabel}`} />
              <div className={styles.optionPills}>
                <div className={`${styles.shimmer} ${styles.optionPill}`} />
                <div className={`${styles.shimmer} ${styles.optionPill}`} />
                <div className={`${styles.shimmer} ${styles.optionPill}`} />
              </div>
            </div>

            <div className={styles.buttonRow}>
              <div className={`${styles.shimmer} ${styles.primaryButton}`} />
              <div className={`${styles.shimmer} ${styles.secondaryButton}`} />
            </div>

            <div className={`${styles.shimmer} ${styles.deliveryBox}`} />
          </div>
        </div>

        {/* Tabs & Details Skeleton */}
        <div className={styles.sectionPadding}>
          <div className={`${styles.shimmer} ${styles.tabsSkeleton}`} />
        </div>

      </div>
    </div>
  );
}
