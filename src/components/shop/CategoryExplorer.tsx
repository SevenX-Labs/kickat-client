"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Star,
  LayoutGrid,
  List,
  ChevronRight,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  X,
  Filter,
} from 'lucide-react';
import {
  MAIN_CATEGORIES,
  CATALOG_PRODUCTS,
  MainCategory,
  CatalogProduct,
} from '@/data/categoryData';
import styles from './CategoryExplorer.module.css';

const MAIN_CAT_ICONS: Record<string, string> = {
  all: '/category-images/food.png',
  dogs: '/category-images/dog.png',
  cats: '/category-images/cat.png',
  fish: '/category-images/fish.png',
  birds: '/category-images/bird.png',
};

const SUBCAT_IMAGES: Record<string, string> = {
  'dog-accessories': '/category-images/accessories.png',
  'dog-food-treats': '/hero-products/dog_food.png',
  'dog-grooming-hygiene': '/hero-products/pet_bowl.png',
  'dog-feeding': '/hero-products/pet_bowl.png',
  'cat-accessories': '/category-images/toys.png',
  'cat-food': '/hero-products/cat_treats.png',
  'cat-grooming-hygiene': '/category-images/fish.png',
  'cat-feeding': '/hero-products/pet_bowl.png',
  'aquarium-filtration': '/category-images/fish.png',
  'aquarium-pumps': '/category-images/fish.png',
  'aquarium-heating': '/category-images/accessories.png',
  'aquarium-lighting': '/category-images/accessories.png',
  'aquarium-food': '/category-images/food.png',
  'aquarium-care-medicine': '/category-images/food.png',
  'aquarium-tools': '/hero-products/pet_toy.png',
  'bird-feeding': '/hero-products/pet_bowl.png',
  'bird-food': '/category-images/bird.png',
};

export function CategoryExplorer() {
  // State
  const [selectedMainCat, setSelectedMainCat] = useState<string>('dogs');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Active Main Category Object
  const activeMainCatObj = useMemo(() => {
    return MAIN_CATEGORIES.find((c) => c.slug === selectedMainCat) || MAIN_CATEGORIES[1];
  }, [selectedMainCat]);

  // Main category click handler
  const handleMainCategoryClick = (catSlug: string) => {
    setSelectedMainCat(catSlug);
    setSelectedSubCat('all');
    setCurrentPage(1);
  };

  // Subcategory click handler
  const handleSubCategoryClick = (subSlug: string) => {
    setSelectedSubCat(subSlug);
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedMainCat('dogs');
    setSelectedSubCat('all');
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((product) => {
      // Main category filter
      if (selectedMainCat !== 'all' && product.mainCategory !== selectedMainCat) {
        return false;
      }
      // Subcategory filter
      if (selectedSubCat !== 'all' && product.subCategory !== selectedSubCat) {
        return false;
      }
      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [selectedMainCat, selectedSubCat, searchQuery, sortBy]);

  // Pagination calculation
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        {/* Top Header Row with Breadcrumb & Top Right Search Bar */}
        <div className={styles.topBar}>
          <nav className={styles.breadcrumb}>
            <Link href="/" className={styles.crumbLink}>Home</Link>
            <span className={styles.crumbSep}>/</span>
            <Link href="/categories" onClick={() => resetFilters()} className={styles.crumbLink}>All Categories</Link>
            {selectedMainCat !== 'all' && (
              <>
                <span className={styles.crumbSep}>/</span>
                <span className={styles.crumbActive}>{activeMainCatObj.name}</span>
              </>
            )}
            {selectedSubCat !== 'all' && (
              <>
                <span className={styles.crumbSep}>/</span>
                <span className={styles.crumbSubActive}>
                  {activeMainCatObj.subcategories.find((s) => s.slug === selectedSubCat)?.name}
                </span>
              </>
            )}
          </nav>

          {/* Top Right Search Bar */}
          <div className={styles.topRightSearchBox}>
            <Search size={15} className={styles.topRightSearchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.topRightSearchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.topRightClearBtn}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Master Category Browsing Layout: Left Vertical Category Rail + Right Content Panel */}
        <div className={styles.masterLayout}>
          
          {/* 1. LEFT SIDEBAR: Vertical Category Navigation Rail */}
          <aside className={styles.categoryRail}>
            <div className={styles.railHeader}>
              <span className={styles.railTitle}>CATEGORIES</span>
            </div>
            <div className={styles.railList}>
              {MAIN_CATEGORIES.map((cat) => {
                const isSelected = selectedMainCat === cat.slug;
                const iconSrc = MAIN_CAT_ICONS[cat.slug] || '/category-images/food.png';

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleMainCategoryClick(cat.slug)}
                    className={`${styles.railItem} ${isSelected ? styles.railItemActive : ''}`}
                  >
                    <div className={styles.railAvatarWrap}>
                      <Image
                        src={iconSrc}
                        alt={cat.name}
                        width={36}
                        height={36}
                        className={styles.railAvatar}
                      />
                    </div>
                    <span className={styles.railLabel}>{cat.name}</span>
                    {isSelected && <div className={styles.activeBar} />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 2. RIGHT PANEL: Subcategories & Products */}
          <main className={styles.mainPanel}>

            {/* STEP A: MAIN CATEGORY SUBCATEGORIES GRID (Shown when selectedSubCat === 'all') */}
            {selectedSubCat === 'all' && (
              <div className={styles.subCategoriesSection}>
                <div className={styles.subCatSectionHeader}>
                  <div>
                    <span className={styles.subCatEyebrow}>EXPLORE CATALOG</span>
                    <h2 className={styles.subCatMainTitle}>{activeMainCatObj.name} Categories</h2>
                  </div>
                  <span className={styles.subCatCountBadge}>{activeMainCatObj.count} Total Products</span>
                </div>

                {/* Grid of Sub-Categories */}
                <div className={styles.subCategoriesGrid}>
                  {activeMainCatObj.subcategories.map((sub) => {
                    const imgUrl = SUBCAT_IMAGES[sub.slug] || '/category-images/food.png';

                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleSubCategoryClick(sub.slug)}
                        className={styles.subCategoryCard}
                      >
                        <div className={styles.subCardImgWrap}>
                          <Image
                            src={imgUrl}
                            alt={sub.name}
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                        <div className={styles.subCardInfo}>
                          <h3 className={styles.subCardTitle}>{sub.name}</h3>
                          <span className={styles.subCardCount}>{sub.count} items</span>
                          <span className={styles.subCardLink}>
                            Explore <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP B: SUBCATEGORY FILTERED HEADER & PRODUCT TOOLBAR */}
            {selectedSubCat !== 'all' && (
              <div className={styles.subCatActiveHeader}>
                <button
                  onClick={() => setSelectedSubCat('all')}
                  className={styles.backBtn}
                >
                  <ArrowLeft size={15} /> All {activeMainCatObj.name} Subcategories
                </button>

                <div className={styles.subPillsScroll}>
                  <button
                    onClick={() => setSelectedSubCat('all')}
                    className={`${styles.subPill} ${selectedSubCat === 'all' ? styles.subPillActive : ''}`}
                  >
                    All {activeMainCatObj.name}
                  </button>
                  {activeMainCatObj.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubCat(sub.slug)}
                      className={`${styles.subPill} ${selectedSubCat === sub.slug ? styles.subPillActive : ''}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar: Grid/List View, Results Count, Sort Select */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <div className={styles.toolbarViews}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                    title="Grid View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>

                <div className={styles.resultsText}>
                  Showing <strong>{filteredProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} – {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> results
                </div>
              </div>

              <div className={styles.sortBlock}>
                <label className={styles.sortLabel}>SORT BY:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="featured">Featured & Popular</option>
                  <option value="name-asc">Alphabetically, A-Z</option>
                  <option value="name-desc">Alphabetically, Z-A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid / List */}
            {filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={40} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No products found</h3>
                <p className={styles.emptySubtitle}>Try selecting another sub-category or clearing your search query.</p>
                <button onClick={resetFilters} className={styles.resetBtn}>
                  <RotateCcw size={16} /> Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid' ? styles.productGrid : styles.productList
                }
              >
                {paginatedProducts.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.cardImageContainer}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'contain' }}
                        className={styles.productImg}
                      />
                      {product.badge && (
                        <span
                          className={`${styles.badge} ${
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
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Added ${product.name} to cart!`);
                        }}
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

                      <div className={styles.priceContainer}>
                        <span className={styles.price}>₹{product.price}</span>
                        {product.originalPrice && (
                          <span className={styles.originalPrice}>₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={styles.pageArrow}
                >
                  «
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`${styles.pageNum} ${currentPage === pageNum ? styles.pageActive : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className={styles.pageArrow}
                >
                  »
                </button>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
