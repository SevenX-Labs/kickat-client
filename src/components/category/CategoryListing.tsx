"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Star,
  ShoppingBag,
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  Grid2X2,
  X,
  ChevronRight,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { CategoryInfo, Product } from '@/data/categoryData';
import styles from './CategoryListing.module.css';

interface CategoryListingProps {
  category: CategoryInfo;
}

export function CategoryListing({ category }: CategoryListingProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Toggle helpers
  const toggleSubcategory = (name: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const toggleBrand = (name: string) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setMaxPrice(6000);
    setSelectedSubcategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setMinRating(0);
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (maxPrice < 6000 ? 1 : 0) +
    selectedSubcategories.length +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return category.products.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (p.price > maxPrice) return false;
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(p.subcategory || p.subCategory)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (inStockOnly && !p.inStock) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [category.products, searchQuery, maxPrice, selectedSubcategories, selectedBrands, inStockOnly, minRating, sortBy]);

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Breadcrumb & Header */}
      <div className={styles.topContainer}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/categories" className={styles.breadcrumbLink}>Shop by Category</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{category.name}</span>
        </nav>

        <div className={styles.pageHeader}>
          <div className={styles.headerTitleRow}>
            <div>
              <span className={styles.eyebrow}>CATEGORY</span>
              <h1 className={styles.pageTitle}>{category.name}</h1>
            </div>
            <span className={styles.countBadge}>
              {filteredProducts.length} products
            </span>
          </div>
          <p className={styles.subcopy}>{category.subcopy}</p>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Main Content */}
      <div className={styles.mainLayout}>
        {/* 3. Sidebar Filters Column */}
        <aside className={`${styles.sidebar} ${mobileFilterOpen ? styles.sidebarMobileOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitleRow}>
              <SlidersHorizontal className={styles.filterIcon} size={18} />
              <h2 className={styles.sidebarTitle}>Filter Products</h2>
              {activeFilterCount > 0 && (
                <span className={styles.activePill}>{activeFilterCount}</span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className={styles.clearBtn}>
                Clear all
              </button>
            )}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className={styles.closeMobileBtn}
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filter Search */}
          <div className={styles.filterGroup}>
            <div className={styles.searchWrap}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={styles.searchClear}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Price Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.groupHeader}>
              <span className={styles.groupTitle}>Max Price</span>
              <span className={styles.priceValue}>₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={200}
              max={6000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className={styles.rangeSlider}
            />
            <div className={styles.rangeLabels}>
              <span>₹200</span>
              <span>₹6,000</span>
            </div>
          </div>

          {/* Subcategories Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.groupHeader}>
              <span className={styles.groupTitle}>Subcategory</span>
            </div>
            <div className={styles.checkList}>
              {category.subcategories.map((sub) => {
                const checked = selectedSubcategories.includes(sub.name);
                return (
                  <label key={sub.name} className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubcategory(sub.name)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkText}>{sub.name}</span>
                    <span className={styles.checkCountBadge}>{sub.count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Brands Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.groupHeader}>
              <span className={styles.groupTitle}>Brand</span>
            </div>
            <div className={styles.checkList}>
              {category.brands.map((b) => {
                const checked = selectedBrands.includes(b.name);
                return (
                  <label key={b.name} className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(b.name)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkText}>{b.name}</span>
                    <span className={styles.checkCountBadge}>{b.count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability & Rating Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.groupHeader}>
              <span className={styles.groupTitle}>Options</span>
            </div>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkText}>In Stock Only</span>
            </label>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={minRating === 4.5}
                onChange={(e) => setMinRating(e.target.checked ? 4.5 : 0)}
                className={styles.checkbox}
              />
              <span className={styles.checkText}>4.5★ & Above</span>
            </label>
          </div>

          {/* 8. Sidebar Promo Tile */}
          <div className={styles.promoTile}>
            <div className={styles.promoImageWrap}>
              <Image
                src={category.promo.image}
                alt={category.promo.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.promoContent}>
              <span className={styles.promoBadge}>LIMITED OFFER</span>
              <h4 className={styles.promoTitle}>{category.promo.title}</h4>
              <p className={styles.promoSubtitle}>{category.promo.subtitle}</p>
              <button className={styles.promoBtn}>
                Use code {category.promo.code} &rarr;
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* 4. Bestsellers Strip at Top of Results */}
          <div className={styles.bestsellersSection}>
            <div className={styles.bestsellersHeader}>
              <span className={styles.sectionEyebrow}>TOP RATED IN CATEGORY</span>
              <h3 className={styles.bestsellersTitle}>Category Bestsellers</h3>
            </div>
            <div className={styles.bestsellersGrid}>
              {category.bestsellers.map((item) => (
                <div key={item.id} className={styles.bestsellerCard}>
                  <div className={styles.bestsellerImgWrap}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className={styles.bestsellerImg}
                    />
                    {item.badge && (
                      <span className={styles.cardBadge}>{item.badge}</span>
                    )}
                  </div>
                  <div className={styles.bestsellerInfo}>
                    <span className={styles.brandTag}>{item.brand}</span>
                    <h4 className={styles.bestsellerName}>{item.name}</h4>
                    <div className={styles.ratingRow}>
                      <Star className={styles.starIcon} size={14} fill="#E7A03B" color="#E7A03B" />
                      <span className={styles.ratingNum}>{item.rating}</span>
                      <span className={styles.reviewCount}>({item.reviewsCount})</span>
                    </div>
                    <div className={styles.bestsellerFooter}>
                      <span className={styles.bestsellerPrice}>₹{item.price.toLocaleString()}</span>
                      <button className={styles.addCartBtn}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Toolbar Row */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className={styles.mobileFilterToggle}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className={styles.activePill}>{activeFilterCount}</span>
                )}
              </button>

              <div className={styles.sortWrapper}>
                <label htmlFor="sortSelect" className={styles.sortLabel}>Sort by:</label>
                <select
                  id="sortSelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={styles.sortSelect}
                >
                  <option value="featured">Featured & Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className={styles.toolbarRight}>
              <span className={styles.resultCount}>
                Showing <strong>{filteredProducts.length}</strong> products
              </span>
              <div className={styles.gridToggle}>
                <button
                  onClick={() => setGridCols(2)}
                  className={`${styles.densityBtn} ${gridCols === 2 ? styles.densityActive : ''}`}
                  title="2 Columns"
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`${styles.densityBtn} ${gridCols === 3 ? styles.densityActive : ''}`}
                  title="3 Columns"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`${styles.densityBtn} ${gridCols === 4 ? styles.densityActive : ''}`}
                  title="4 Columns"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 7. Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <Search size={40} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No matching products found</h3>
              <p className={styles.emptyDesc}>Try adjusting your price range or clearing your subcategory/brand filters.</p>
              <button onClick={clearAllFilters} className={styles.resetBtn}>
                <RotateCcw size={16} /> Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={styles.productGrid}
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                }}
              >
                {filteredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* 5. Mid-page Category Banner */}
              <div className={styles.midBanner}>
                <div className={styles.bannerImageWrap}>
                  <Image
                    src={category.banner.image}
                    alt={category.banner.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className={styles.bannerOverlay} />
                </div>
                <div className={styles.bannerContent}>
                  <span className={styles.bannerEyebrow}>KICKAT EDITORIAL</span>
                  <h3 className={styles.bannerTitle}>{category.banner.title}</h3>
                  <p className={styles.bannerSubtitle}>{category.banner.subtitle}</p>
                  <button className={styles.bannerCta}>{category.banner.cta} &rarr;</button>
                </div>
              </div>

              {/* Remaining Product Grid */}
              {filteredProducts.length > 4 && (
                <div
                  className={styles.productGrid}
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  }}
                >
                  {filteredProducts.slice(4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* 9. Pagination / Load More */}
              <div className={styles.paginationArea}>
                <button className={styles.loadMoreBtn}>
                  Load More Products &darr;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className={styles.productCard}>
      <div className={styles.cardImageWrap}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          style={{ objectFit: 'contain' }}
          className={styles.cardImg}
        />
        {product.badge && (
          <span className={styles.pillBadge}>{product.badge}</span>
        )}
        {/* Quick Add to Cart Icon on Hover */}
        <button
          className={styles.quickAddBtn}
          title="Quick add to cart"
          onClick={(e) => {
            e.preventDefault();
            alert(`Added ${product.name} to cart!`);
          }}
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      <div className={styles.cardBody}>
        <span className={styles.cardBrand}>{product.brand}</span>
        <h3 className={styles.cardName}>{product.name}</h3>

        <div className={styles.cardRatingRow}>
          <Star size={14} fill="#E7A03B" color="#E7A03B" />
          <span className={styles.cardRatingVal}>{product.rating}</span>
          <span className={styles.cardReviews}>({product.reviewsCount})</span>
        </div>

        <div className={styles.cardPriceRow}>
          <span className={styles.cardPrice}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={styles.cardOriginalPrice}>
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
