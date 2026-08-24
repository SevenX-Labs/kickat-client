"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  ShoppingBag,
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  Grid2X2,
  X,
  RotateCcw,
} from 'lucide-react';
import { CategoryInfo } from '@/data/categoryData';
import styles from './CategoryListing.module.css';

interface CategoryListingProps {
  category: CategoryInfo;
}

export function CategoryListing({ category }: CategoryListingProps) {
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    category.subcategoryName ? [category.subcategoryName] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Handlers
  const toggleSubcategory = (name: string, slug: string) => {
    setSelectedSubcategories((prev) => {
      const next = prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name];
      return next;
    });
    // Navigate laterally
    router.push(`/category/${category.categorySlug}/${slug}`);
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
      if (
        selectedSubcategories.length > 0 &&
        !selectedSubcategories.some(
          (subName) =>
            p.subcategory?.toLowerCase() === subName.toLowerCase() ||
            category.subcategories.find((s) => s.name === subName)?.slug === p.subCategory
        )
      ) {
        return false;
      }
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
  }, [category.products, category.subcategories, searchQuery, maxPrice, selectedSubcategories, selectedBrands, inStockOnly, minRating, sortBy]);

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Breadcrumb & Header */}
      <div className={styles.topContainer}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href={`/category/${category.categorySlug}`} className={styles.breadcrumbLink}>
            {category.mainCategoryName}
          </Link>
          {category.subcategoryName && (
            <>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{category.subcategoryName}</span>
            </>
          )}
        </nav>
      </div>

      {/* Main Layout: Sidebar Filters + Main Content */}
      <div className={styles.mainLayout}>
        
        {/* 3. Sidebar Filters Column (Sticky) */}
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
                const checked = selectedSubcategories.includes(sub.name) || category.subcategorySlug === sub.slug;
                return (
                  <label key={sub.slug} className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubcategory(sub.name, sub.slug)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkText}>{sub.name}</span>
                    <span className={styles.checkCountBadge}>{sub.count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Options Filter */}
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
        </aside>

        {/* Content Area */}
        <div className={styles.contentArea}>
          
          {/* Bestsellers Strip at Top of Results */}
          {category.bestsellers.length > 0 && (
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
                        <span
                          className={`${styles.cardBadge} ${
                            item.badge === 'New'
                              ? styles.badgeInk
                              : item.badge === 'Organic'
                              ? styles.badgeForest
                              : styles.badgeAmber
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className={styles.bestsellerInfo}>
                      <span className={styles.brandTag}>{item.brand}</span>
                      <h4 className={styles.bestsellerName}>{item.name}</h4>
                      <div className={styles.ratingRow}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < item.rating ? '#E7A03B' : 'none'}
                            color={i < item.rating ? '#E7A03B' : '#dcdcdc'}
                          />
                        ))}
                      </div>
                      <div className={styles.bestsellerFooter}>
                        <span className={styles.bestsellerPrice}>₹{item.price.toLocaleString()}</span>
                        <button
                          className={styles.addCartBtn}
                          onClick={() => alert(`Added ${item.name} to cart!`)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar Row */}
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
                <label htmlFor="sortSelect" className={styles.sortLabel}>SORT BY:</label>
                <select
                  id="sortSelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-low' | 'price-high' | 'rating')}
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

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <RotateCcw size={40} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No products match your filters</h3>
              <p className={styles.emptySubtitle}>Try adjusting your price range, search query, or brand selections.</p>
              <button onClick={clearAllFilters} className={styles.resetBtn}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={`${styles.productGrid} ${styles[`gridCols${gridCols}`]}`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.cardImgContainer}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className={styles.productImg}
                    />
                    {product.badge && (
                      <span
                        className={`${styles.cardBadge} ${
                          product.badge === 'New'
                            ? styles.badgeInk
                            : product.badge === 'Organic'
                            ? styles.badgeForest
                            : styles.badgeAmber
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}
                    <button
                      className={styles.quickAddBtn}
                      onClick={() => alert(`Added ${product.name} to cart!`)}
                      title="Add to Cart"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.ratingRow}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < product.rating ? '#E7A03B' : 'none'}
                          color={i < product.rating ? '#E7A03B' : '#dcdcdc'}
                        />
                      ))}
                    </div>

                    <h3 className={styles.productTitle}>{product.name}</h3>

                    <div className={styles.priceRow}>
                      <span className={styles.price}>₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
