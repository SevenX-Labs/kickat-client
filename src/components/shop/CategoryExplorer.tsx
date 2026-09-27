"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { Category } from '@/types/category';
import { productService } from '@/services/productService';
import { mapBackendProductToCard } from '@/types/product';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './CategoryExplorer.module.css';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', '2XL'];
const COLOR_SWATCHES = [
  { name: 'Amber', hex: '#E7A03B' },
  { name: 'Forest', hex: '#333F2B' },
  { name: 'Ink', hex: '#211C15' },
  { name: 'Orange', hex: '#F99205' },
];

const ITEMS_PER_PAGE = 8;

interface CategoryExplorerProps {
  initialMainCat?: string;
  initialSubCat?: string;
}

export function CategoryExplorer({
  initialMainCat = 'dog',
  initialSubCat = 'all',
}: CategoryExplorerProps) {
  const router = useRouter();

  // Categories from Backend Tree
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [selectedMainCat, setSelectedMainCat] = useState<string>(initialMainCat);
  const [selectedSubCat, setSelectedSubCat] = useState<string>(initialSubCat);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Products from Backend
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch Categories Tree from Backend API
  useEffect(() => {
    let isMounted = true;
    setCategoriesLoading(true);
    categoryService.getCategoryTree()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.categories)) {
          setCategoriesTree(res.categories);
        }
      })
      .catch((err) => {
        console.error("Failed to load category tree:", err);
      })
      .finally(() => {
        if (isMounted) setCategoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state if props change
  useEffect(() => {
    if (initialMainCat) setSelectedMainCat(initialMainCat);
    if (initialSubCat) setSelectedSubCat(initialSubCat);
  }, [initialMainCat, initialSubCat]);

  // Active Main Category Object
  const activeMainCatObj = useMemo(() => {
    if (categoriesTree.length === 0) {
      return {
        id: 'all',
        name: 'All Categories',
        slug: 'all',
        imageUrl: null,
        children: [],
      };
    }

    if (selectedMainCat === 'all') {
      const allSubcats = categoriesTree.flatMap((c) => c.children || []);
      return {
        id: 'all',
        name: 'All Categories',
        slug: 'all',
        imageUrl: null,
        children: allSubcats,
      };
    }

    const found = categoriesTree.find(
      (c) => c.slug.toLowerCase() === selectedMainCat.toLowerCase() ||
             c.id === selectedMainCat ||
             (c.slug === 'dog' && (selectedMainCat === 'dogs' || selectedMainCat === 'dog')) ||
             (c.slug === 'cat' && (selectedMainCat === 'cats' || selectedMainCat === 'cat')) ||
             (c.slug === 'birds' && (selectedMainCat === 'bird' || selectedMainCat === 'birds'))
    );

    if (found) {
      return found;
    }

    return categoriesTree[0] || {
      id: selectedMainCat,
      name: selectedMainCat.charAt(0).toUpperCase() + selectedMainCat.slice(1),
      slug: selectedMainCat,
      imageUrl: null,
      children: [],
    };
  }, [selectedMainCat, categoriesTree]);

  // Active Sub Category Object
  const activeSubCatObj = useMemo(() => {
    if (selectedSubCat === 'all') return null;
    return (activeMainCatObj.children || []).find((s) => s.slug === selectedSubCat || s.id === selectedSubCat) || null;
  }, [activeMainCatObj, selectedSubCat]);

  // Fetch real products from backend API
  const fetchCatalogProducts = useCallback(async () => {
    setLoading(true);
    try {
      let apiSort: any = 'popularity';
      if (sortBy === 'price-low') apiSort = 'price_asc';
      else if (sortBy === 'price-high') apiSort = 'price_desc';
      else if (sortBy === 'rating') apiSort = 'rating';
      else if (sortBy === 'newest') apiSort = 'newest';

      let targetCat = selectedSubCat !== 'all' ? selectedSubCat : selectedMainCat;
      let res;

      if (targetCat && targetCat !== 'all') {
        res = await categoryService.getCategoryProducts(targetCat, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: apiSort,
        }).catch(() => null);
      }

      if (!res || !res.success) {
        let speciesParam: string | undefined = undefined;
        if (selectedMainCat === 'dogs' || selectedMainCat === 'dog') speciesParam = 'dog';
        else if (selectedMainCat === 'cats' || selectedMainCat === 'cat') speciesParam = 'cat';
        else if (selectedMainCat === 'fish') speciesParam = 'fish';
        else if (selectedMainCat === 'birds' || selectedMainCat === 'bird') speciesParam = 'bird';

        res = await productService.getProducts({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: apiSort,
          petSpecies: speciesParam,
        });
      }

      if (res && res.success && Array.isArray(res.products)) {
        let mapped = res.products.map(mapBackendProductToCard);

        if (selectedSize) {
          mapped = mapped.filter((p: any) => p.sizes && p.sizes.includes(selectedSize));
        }
        if (selectedColor) {
          mapped = mapped.filter((p: any) => p.color === selectedColor);
        }

        setProducts(mapped);
        setTotalCount(res.meta?.total || mapped.length);
        setTotalPages(res.meta?.totalPages || Math.ceil((res.meta?.total || mapped.length) / ITEMS_PER_PAGE) || 1);
      } else {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load catalog products:', err);
      setProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedMainCat, selectedSubCat, sortBy, currentPage, selectedSize, selectedColor]);

  useEffect(() => {
    fetchCatalogProducts();
  }, [fetchCatalogProducts]);

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
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedSubCat('all');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const hasSubcategories = (activeMainCatObj.children && activeMainCatObj.children.length > 0);

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
                <ArrowLeft size={14} /> Back to {activeMainCatObj.name}
              </button>
            )}

            {/* Main Categories Vertical Rail */}
            <div className={styles.railList}>
              {/* All Categories Item */}
              <button
                onClick={() => handleMainCategoryClick('all')}
                className={`${styles.railItem} ${selectedMainCat === 'all' ? styles.railItemActive : ''}`}
              >
                <div className={styles.railAvatarWrap}>
                  <LayoutGrid size={20} className={selectedMainCat === 'all' ? styles.activeIcon : styles.railIcon} />
                </div>
                <span className={styles.railLabel}>All</span>
                {selectedMainCat === 'all' && <div className={styles.activeBar} />}
              </button>

              {/* Backend Categories */}
              {categoriesTree.map((cat) => {
                const isSelected = selectedMainCat.toLowerCase() === cat.slug.toLowerCase() ||
                                   (cat.slug === 'dog' && selectedMainCat === 'dogs') ||
                                   (cat.slug === 'cat' && selectedMainCat === 'cats') ||
                                   (cat.slug === 'birds' && selectedMainCat === 'bird');

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleMainCategoryClick(cat.slug)}
                    className={`${styles.railItem} ${isSelected ? styles.railItemActive : ''}`}
                  >
                    <div className={styles.railAvatarWrap}>
                      {cat.imageUrl ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden">
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            sizes="36px"
                            style={{ objectFit: 'cover' }}
                            className={styles.railAvatar}
                          />
                        </div>
                      ) : (
                        <LayoutGrid size={20} className={isSelected ? styles.activeIcon : styles.railIcon} />
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
                  <span>FILTERING: {activeSubCatObj?.name || selectedSubCat}</span>
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

            {/* ── STEP 1: SUBCATEGORIES TILES VIEW (Only shown when selectedSubCat === 'all' AND subcategories exist) ── */}
            {selectedSubCat === 'all' && hasSubcategories && (
              <div className={`${styles.subCategoriesSection} ${styles.viewTransition}`}>
                <div className={styles.subCatSectionHeader}>
                  <div>
                    <span className={styles.subCatEyebrow}>SUBCATEGORIES</span>
                    <h1 className={styles.subCatMainTitle}>{activeMainCatObj.name}</h1>
                  </div>
                  {totalCount > 0 && (
                    <span className={styles.subCatCountBadge}>{totalCount} Products</span>
                  )}
                </div>

                {/* Grid of Sub-Category Cards */}
                <div className={styles.subCategoriesGrid}>
                  {(activeMainCatObj.children || []).map((sub) => (
                    <div
                      key={sub.id || sub.slug}
                      onClick={() => handleSubCategoryClick(sub.slug)}
                      className={styles.subCategoryCard}
                    >
                      <div className={styles.subCardImgWrap}>
                        <div className={styles.subCardImgInner}>
                          {sub.imageUrl ? (
                            <Image
                              src={sub.imageUrl}
                              alt={sub.name}
                              fill
                              sizes="(max-width: 768px) 140px, 160px"
                              style={{ objectFit: 'contain' }}
                              className={styles.subCardImg}
                            />
                          ) : (
                            <LayoutGrid size={28} className="text-stone-400 m-auto" />
                          )}
                        </div>
                      </div>
                      <div className={styles.subCardInfo}>
                        <h2 className={styles.subCardTitle}>{sub.name}</h2>
                        <span className={styles.subCardLink}>
                          Explore <ArrowRight className={styles.linkArrow} size={14} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: PRODUCT LISTING VIEW (Shown if subcategory selected OR if category has no nested subcategories) ── */}
            {(selectedSubCat !== 'all' || !hasSubcategories) && (
              <div className={`${styles.productListingSection} ${styles.viewTransition}`}>
                
                {/* Horizontal Subcategory Pill Switcher (Only if subcategories exist) */}
                {hasSubcategories && (
                  <div className={styles.subPillsBar}>
                    <span className={styles.subBarLabel}>SUBCATEGORIES:</span>
                    <div className={styles.subPillsScroll}>
                      <button
                        onClick={handleBackToSubCategories}
                        className={styles.subPill}
                      >
                        All {activeMainCatObj.name}
                      </button>
                      {(activeMainCatObj.children || []).map((sub) => (
                        <button
                          key={sub.id || sub.slug}
                          onClick={() => handleSubCategoryClick(sub.slug)}
                          className={`${styles.subPill} ${selectedSubCat === sub.slug ? styles.subPillActive : ''}`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                      Showing <strong>{products.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} – {Math.min(currentPage * ITEMS_PER_PAGE, totalCount || products.length)}</strong> of <strong>{totalCount || products.length}</strong> results
                    </div>
                  </div>

                  <div className={styles.sortBlock}>
                    <label className={styles.sortLabel}>SORT BY:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={styles.sortSelect}
                    >
                      <option value="featured">Featured & Popular</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Product Grid / List */}
                {loading ? (
                  <div className={styles.productGrid}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} style={{ height: 320, background: '#FAF7F2', borderRadius: 16, border: '1px solid #EBE5DB', padding: 16 }}>
                        <Skeleton style={{ height: 180, width: '100%', borderRadius: 12, marginBottom: 12 }} />
                        <Skeleton style={{ height: 20, width: '80%', marginBottom: 8 }} />
                        <Skeleton style={{ height: 24, width: '40%' }} />
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className={styles.emptyState}>
                    <RotateCcw size={36} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No products found</h3>
                    <p className={styles.emptySubtitle}>We are stocking new products in this category soon.</p>
                    {(selectedSize || selectedColor) && (
                      <button onClick={resetFilters} className={styles.resetBtn}>
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid' ? styles.productGrid : styles.productList
                    }
                  >
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                  <div className={styles.pagination}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className={styles.pageArrow}
                    >
                      «
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => {
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
