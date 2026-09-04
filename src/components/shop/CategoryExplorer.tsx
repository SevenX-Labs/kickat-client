"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '../common/ProductCard/ProductCard';
import { useRouter } from 'next/navigation';
import {
  Star,
  LayoutGrid,
  List,
  ShoppingBag,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  MAIN_CATEGORIES,
  CATALOG_PRODUCTS,
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

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', '2XL'];
const COLOR_SWATCHES = [
  { name: 'Amber', hex: '#E7A03B' },
  { name: 'Forest', hex: '#333F2B' },
  { name: 'Ink', hex: '#211C15' },
  { name: 'Orange', hex: '#F5821F' },
];

interface CategoryExplorerProps {
  initialMainCat?: string;
  initialSubCat?: string;
}

export function CategoryExplorer({
  initialMainCat = 'dogs',
  initialSubCat = 'all',
}: CategoryExplorerProps) {
  const router = useRouter();
  // State initialized from props
  const [selectedMainCat, setSelectedMainCat] = useState<string>(initialMainCat);
  const [selectedSubCat, setSelectedSubCat] = useState<string>(initialSubCat);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state if props change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialMainCat) setSelectedMainCat(initialMainCat);
    if (initialSubCat) setSelectedSubCat(initialSubCat);
  }, [initialMainCat, initialSubCat]);

  // Active Main Category Object
  const activeMainCatObj = useMemo(() => {
    if (selectedMainCat === 'all') {
      const allSubcats = MAIN_CATEGORIES.filter((c) => c.slug !== 'all')
        .flatMap((c) => c.subcategories);
      return {
        id: 'all',
        name: 'All Categories',
        slug: 'all',
        count: CATALOG_PRODUCTS.length,
        subcategories: allSubcats,
      };
    }
    return MAIN_CATEGORIES.find((c) => c.slug === selectedMainCat) || MAIN_CATEGORIES[1];
  }, [selectedMainCat]);

  // Active Sub Category Object
  const activeSubCatObj = useMemo(() => {
    if (selectedSubCat === 'all') return null;
    return activeMainCatObj.subcategories.find((s) => s.slug === selectedSubCat) || null;
  }, [activeMainCatObj, selectedSubCat]);

  // Handlers with URL synchronization
  const handleMainCategoryClick = (catSlug: string) => {
    setSelectedMainCat(catSlug);
    setSelectedSubCat('all');
    setSelectedSize(null);
    setSelectedColor(null);
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/categories/${catSlug}`);
    }
  };

  const handleSubCategoryClick = (subSlug: string) => {
    router.push(`/category/${selectedMainCat}/${subSlug}`);
  };

  const handleBackToSubCategories = () => {
    setSelectedSubCat('all');
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/categories/${selectedMainCat}`);
    }
  };

  const resetFilters = () => {
    setSelectedMainCat('dogs');
    setSelectedSubCat('all');
    setSelectedSize(null);
    setSelectedColor(null);
    setSortBy('featured');
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/categories/dogs`);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((product) => {
      if (selectedMainCat !== 'all' && product.mainCategory !== selectedMainCat) {
        return false;
      }
      if (selectedSubCat !== 'all' && product.subCategory !== selectedSubCat) {
        return false;
      }
      if (selectedSize && (!product.sizes || !product.sizes.includes(selectedSize))) {
        return false;
      }
      if (selectedColor && product.color !== selectedColor) {
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
  }, [selectedMainCat, selectedSubCat, selectedSize, selectedColor, sortBy]);

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
        
        {/* Master 2-Step Browsing Layout */}
        <div className={styles.masterLayout}>
          
          {/* LEFT SIDEBAR: Categories Rail or Filter Panel */}
          <aside className={styles.sidebar}>
            
            {/* Step 2 Back Button at top of sidebar when viewing subcategory products */}
            {selectedSubCat !== 'all' && (
              <button
                onClick={handleBackToSubCategories}
                className={styles.backNavBtn}
              >
                <ArrowLeft size={14} /> Back to {activeMainCatObj.name} Categories
              </button>
            )}

            {/* Main Categories Vertical Rail */}
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
                      {cat.slug === 'all' ? (
                        <LayoutGrid size={20} className={isSelected ? styles.activeIcon : styles.railIcon} />
                      ) : (
                        <Image
                          src={iconSrc}
                          alt={cat.name}
                          width={36}
                          height={36}
                          className={styles.railAvatar}
                        />
                      )}
                    </div>
                    <span className={styles.railLabel}>{cat.name}</span>
                    {isSelected && <div className={styles.activeBar} />}
                  </button>
                );
              })}
            </div>

            {/* Additional Subcategory Filters (Shown in Step 2 Product Listing) */}
            {selectedSubCat !== 'all' && (
              <div className={styles.filtersBlock}>
                <div className={styles.filterActivePill}>
                  <Filter size={12} />
                  <span>FILTERING: {activeSubCatObj?.name}</span>
                </div>

                {/* Size Filter */}
                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupTitle}>Size</span>
                  <div className={styles.sizePillsGrid}>
                    {AVAILABLE_SIZES.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                        className={`${styles.sizeBtn} ${selectedSize === sz ? styles.sizeActive : ''}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupTitle}>Color</span>
                  <div className={styles.colorRow}>
                    {COLOR_SWATCHES.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(selectedColor === col.hex ? null : col.hex)}
                        className={`${styles.colorSwatch} ${selectedColor === col.hex ? styles.colorActive : ''}`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {selectedColor === col.hex && <Check size={12} color="#fff" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT MAIN PANEL */}
          <main className={styles.mainPanel}>

            {/* ── STEP 1: SUBCATEGORIES TILES VIEW (Only shown when selectedSubCat === 'all') ── */}
            {selectedSubCat === 'all' && (
              <div className={`${styles.subCategoriesSection} ${styles.viewTransition}`}>
                <div className={styles.subCatSectionHeader}>
                  <div>
                    <span className={styles.subCatEyebrow}>SUBCATEGORIES</span>
                    <h1 className={styles.subCatMainTitle}>{activeMainCatObj.name}</h1>
                  </div>
                  <span className={styles.subCatCountBadge}>{activeMainCatObj.count} Products</span>
                </div>

                {/* Grid of Sub-Category Cards */}
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
                            className={styles.subCardImg}
                          />
                        </div>
                        <div className={styles.subCardInfo}>
                          <span className={styles.subCardCount}>{sub.count} items</span>
                          <h2 className={styles.subCardTitle}>{sub.name}</h2>
                          <span className={styles.subCardLink}>
                            Explore <ArrowRight className={styles.linkArrow} size={14} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: PRODUCT LISTING VIEW (Shown after clicking a subcategory) ── */}
            {selectedSubCat !== 'all' && (
              <div className={`${styles.productListingSection} ${styles.viewTransition}`}>
                
                {/* Horizontal Subcategory Pill Switcher */}
                <div className={styles.subPillsBar}>
                  <span className={styles.subBarLabel}>SUBCATEGORIES:</span>
                  <div className={styles.subPillsScroll}>
                    <button
                      onClick={handleBackToSubCategories}
                      className={styles.subPill}
                    >
                      All {activeMainCatObj.name}
                    </button>
                    {activeMainCatObj.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubCategoryClick(sub.slug)}
                        className={`${styles.subPill} ${selectedSubCat === sub.slug ? styles.subPillActive : ''}`}
                      >
                        {sub.name} ({sub.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toolbar Row */}
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

                {/* Product Grid / List */}
                {filteredProducts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <RotateCcw size={36} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No products match your active filters</h3>
                    <p className={styles.emptySubtitle}>Try clearing active size/color filters or viewing all subcategories.</p>
                    <button onClick={resetFilters} className={styles.resetBtn}>
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid' ? styles.productGrid : styles.productList
                    }
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product as any} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
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
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
