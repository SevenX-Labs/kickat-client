"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductCard from '../common/ProductCard/ProductCard';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Filter,
} from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { Category, CategoryProductsQuery } from '@/types/category';
import { productService } from '@/services/productService';
import { mapBackendProductListToCards } from '@/types/product';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './CategoryListing.module.css';

interface CategoryListingProps {
  categorySlug: string;
  subcategorySlug?: string;
}

const ITEMS_PER_PAGE = 12;

export function CategoryListing({ categorySlug, subcategorySlug }: CategoryListingProps) {
  const router = useRouter();

  // Category and Tree State
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);

  // Products and Meta State
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Status States
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Filter & UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active identifier for API query
  const targetSlug = useMemo(() => {
    return (subcategorySlug || categorySlug || '').trim();
  }, [subcategorySlug, categorySlug]);

  // Lock background scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileFilterOpen]);

  // 1. Fetch Category Information & Tree
  useEffect(() => {
    let isMounted = true;
    setCategoryLoading(true);
    setError(null);
    setNotFound(false);

    async function loadCategoryDetails() {
      try {
        // Fetch Category Tree in parallel
        const treePromise = categoryService.getCategoryTree().catch(() => ({ success: false, categories: [] }));
        
        // Attempt fetching target category
        let catRes = await categoryService.getCategoryById(targetSlug).catch(async () => {
          // If 404 and slug is e.g. "dogs" or "dog", try alternative slug
          if (targetSlug.endsWith('s')) {
            const singular = targetSlug.slice(0, -1);
            return categoryService.getCategoryById(singular).catch(() => null);
          } else {
            const plural = `${targetSlug}s`;
            return categoryService.getCategoryById(plural).catch(() => null);
          }
        });

        const treeRes = await treePromise;

        if (!isMounted) return;

        if (treeRes.success && Array.isArray(treeRes.categories)) {
          setCategoryTree(treeRes.categories);
        }

        if (catRes && catRes.success && catRes.category) {
          setCategory(catRes.category);
          setNotFound(false);

          // Find parent category if target is a subcategory
          if (catRes.category.parentId && treeRes.success) {
            const parent = treeRes.categories.find((c) => c.id === catRes!.category.parentId);
            setParentCategory(parent || null);
          } else {
            setParentCategory(null);
          }
        } else {
          // If no direct category match, check if categorySlug exists in tree
          if (treeRes.success) {
            const matched = treeRes.categories.find(
              (c) => c.slug.toLowerCase() === categorySlug.toLowerCase() ||
                     c.slug.toLowerCase() === targetSlug.toLowerCase() ||
                     (c.slug === 'dog' && (categorySlug === 'dogs' || targetSlug === 'dogs')) ||
                     (c.slug === 'cat' && (categorySlug === 'cats' || targetSlug === 'cats'))
            );
            if (matched) {
              setCategory(matched);
              setNotFound(false);
            } else {
              setNotFound(true);
            }
          } else {
            setNotFound(true);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Failed to load category details:", err);
        setError("Unable to load category details.");
      } finally {
        if (isMounted) setCategoryLoading(false);
      }
    }

    loadCategoryDetails();

    return () => {
      isMounted = false;
    };
  }, [targetSlug, categorySlug]);

  // 2. Fetch Category Products
  const fetchProducts = useCallback(async () => {
    if (notFound) return;
    setLoading(true);
    setError(null);

    try {
      let apiSort: any = 'popularity';
      if (sortBy === 'price-low') apiSort = 'price_asc';
      else if (sortBy === 'price-high') apiSort = 'price_desc';
      else if (sortBy === 'rating') apiSort = 'rating';
      else if (sortBy === 'newest') apiSort = 'newest';

      const queryParams: CategoryProductsQuery = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: apiSort,
      };

      if (maxPrice < 6000) {
        queryParams.priceMax = maxPrice;
      }
      if (inStockOnly) {
        queryParams.inStock = true;
      }

      const activeIdOrSlug = category?.slug || category?.id || targetSlug;
      let rawProducts: any[] = [];
      let totalCount = 0;
      let totalPagesCount = 1;

      let res = await categoryService.getCategoryProducts(activeIdOrSlug, queryParams).catch(async () => {
        // Alternative fallback if plural/singular mismatch
        if (activeIdOrSlug.endsWith('s')) {
          return categoryService.getCategoryProducts(activeIdOrSlug.slice(0, -1), queryParams).catch(() => null);
        } else {
          return categoryService.getCategoryProducts(`${activeIdOrSlug}s`, queryParams).catch(() => null);
        }
      });

      if (res && res.success && Array.isArray(res.products) && res.products.length > 0) {
        rawProducts = res.products;
        totalCount = res.meta?.total ?? rawProducts.length;
        totalPagesCount = res.meta?.totalPages ?? Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
      } else {
        // Fallback: Query general products by pet species
        let speciesParam: string | undefined = undefined;
        const normCat = (parentCategory?.slug || categorySlug || '').toLowerCase();
        if (normCat.includes('dog')) speciesParam = 'dog';
        else if (normCat.includes('cat')) speciesParam = 'cat';
        else if (normCat.includes('fish')) speciesParam = 'fish';
        else if (normCat.includes('bird')) speciesParam = 'bird';

        const fallbackRes = await productService.getProducts({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: apiSort,
          petSpecies: speciesParam,
          priceMax: maxPrice < 6000 ? maxPrice : undefined,
          inStock: inStockOnly || undefined,
        }).catch(() => null);

        if (fallbackRes && fallbackRes.success && Array.isArray(fallbackRes.products)) {
          rawProducts = fallbackRes.products;
          totalCount = fallbackRes.meta?.total ?? rawProducts.length;
          totalPagesCount = fallbackRes.meta?.totalPages ?? Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
        }
      }

      let mapped = mapBackendProductListToCards(rawProducts);

      // Client-side search and rating filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        mapped = mapped.filter((p) => p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
      }
      if (minRating > 0) {
        mapped = mapped.filter((p) => (p.rating || 0) >= minRating);
      }

      setProducts(mapped);
      setTotalProducts(totalCount || mapped.length);
      setTotalPages(totalPagesCount || Math.max(1, Math.ceil((totalCount || mapped.length) / ITEMS_PER_PAGE)));
    } catch (err: any) {
      console.error("Failed to load category products:", err);
      setError("Unable to load products for this category.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, targetSlug, categorySlug, parentCategory, currentPage, sortBy, maxPrice, inStockOnly, searchQuery, minRating, notFound]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const clearAllFilters = () => {
    setSearchQuery('');
    setMaxPrice(6000);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handleSubcategoryClick = (subSlug: string) => {
    const parentSlug = parentCategory?.slug || category?.slug || categorySlug;
    router.push(`/category/${parentSlug}/${subSlug}`);
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (maxPrice < 6000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  // Available Subcategories List from Tree or Category
  const availableSubcategories = useMemo(() => {
    if (category?.children && category.children.length > 0) {
      return category.children;
    }
    if (parentCategory?.children && parentCategory.children.length > 0) {
      return parentCategory.children;
    }
    // Fallback lookup in categoryTree
    const matchedRoot = categoryTree.find(
      (c) => c.id === category?.id || c.slug === categorySlug || c.slug === category?.slug
    );
    return matchedRoot?.children || [];
  }, [category, parentCategory, categoryTree, categorySlug]);

  // Display Name & Breadcrumb
  const categoryDisplayName = category?.name || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));

  // 404 Not Found State
  if (notFound && !categoryLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.topContainer}>
          <div className={styles.emptyState} style={{ padding: '4rem 2rem' }}>
            <RotateCcw size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Category Not Found</h3>
            <p className={styles.emptySubtitle}>
              The category you requested could not be found or is currently inactive.
            </p>
            <Link href="/categories" className={styles.resetBtn}>
              <ArrowLeft size={16} /> Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Mobile Filter Overlay */}
      {mobileFilterOpen && (
        <div
          className={styles.mobileFilterOverlay}
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      <div className={styles.topContainer}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/categories" className={styles.breadcrumbLink}>Categories</Link>
          <span className={styles.breadcrumbSep}>/</span>
          {parentCategory ? (
            <>
              <Link href={`/categories/${parentCategory.slug}`} className={styles.breadcrumbLink}>
                {parentCategory.name}
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{categoryDisplayName}</span>
            </>
          ) : (
            <span className={styles.breadcrumbCurrent}>{categoryDisplayName}</span>
          )}
        </nav>
      </div>

      {/* Main Layout: Sidebar Filters + Main Content */}
      <div className={styles.mainLayout}>
        {/* Sidebar Filters Column (Sticky) */}
        <aside className={`${styles.sidebar} ${mobileFilterOpen ? styles.sidebarMobileOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitleRow}>
              <SlidersHorizontal className={styles.filterIcon} size={18} />
              <h2 className={styles.sidebarTitle}>Filters</h2>
              {activeFilterCount > 0 && (
                <span className={styles.activePill}>{activeFilterCount}</span>
              )}
            </div>
            <div className={styles.sidebarActions}>
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
                <X size={22} />
              </button>
            </div>
          </div>

          <div className={styles.sidebarBody}>
            {/* Sort By Filter Group */}
            <div className={styles.filterGroup}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>Sort By</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className={styles.sidebarSortSelect}
              >
                <option value="featured">Featured & Popular</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
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
                step={50}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={styles.rangeSlider}
              />
              <div className={styles.rangeLabels}>
                <span>₹200</span>
                <span>₹6,000</span>
              </div>
            </div>

            {/* Subcategories in Sidebar */}
            {availableSubcategories.length > 0 && (
              <div className={styles.filterGroup}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupTitle}>Subcategories</span>
                </div>
                <div className={styles.checkList}>
                  {availableSubcategories.map((sub) => {
                    const checked = sub.slug === subcategorySlug || sub.id === targetSlug;
                    return (
                      <label key={sub.id} className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleSubcategoryClick(sub.slug)}
                          className={styles.checkbox}
                        />
                        <span className={styles.checkText}>{sub.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Options Filter */}
            <div className={styles.filterGroup}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>Options</span>
              </div>
              <div className={styles.checkList}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkText}>In Stock Only</span>
                </label>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={minRating === 4.5}
                    onChange={(e) => {
                      setMinRating(e.target.checked ? 4.5 : 0);
                      setCurrentPage(1);
                    }}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkText}>4.5★ & Above</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Apply Footer */}
          <div className={styles.mobileFilterFooter}>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className={styles.applyFilterBtn}
            >
              Apply Filters ({totalProducts})
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {/* Toolbar Row */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarSearch}>
              <Search size={15} className={styles.toolbarSearchIcon} />
              <input
                type="text"
                placeholder="Search category products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.toolbarSearchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={styles.toolbarSearchClear}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.sortWrapper}>
              <label htmlFor="sortSelect" className={styles.sortLabel}>SORT BY:</label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className={styles.sortSelect}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low–High</option>
                <option value="price-high">Price: High–Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className={styles.mobileFilterToggle}
              aria-label="Open filters"
            >
              <SlidersHorizontal size={20} strokeWidth={2} color="#211C15" />
              {activeFilterCount > 0 && (
                <span className={styles.activePill}>{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchProducts()} className="underline font-semibold ml-4">
                Retry
              </button>
            </div>
          )}

          {/* Product Grid / Skeletons / Empty State */}
          {loading ? (
            <div className={`${styles.productGrid} ${styles[`gridCols${gridCols}`]}`}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col gap-3">
                  <Skeleton className="w-full h-48 rounded-xl" />
                  <Skeleton className="w-20 h-4 rounded-md" />
                  <Skeleton className="w-3/4 h-5 rounded-md" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="w-24 h-6 rounded-md" />
                    <Skeleton className="w-20 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <RotateCcw size={32} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No products found</h3>
              <p className={styles.emptySubtitle}>
                {activeFilterCount > 0
                  ? "Try adjusting your filters, price range, or search query."
                  : "We are stocking new products in this category soon."}
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className={styles.resetBtn}>
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`${styles.productGrid} ${styles[`gridCols${gridCols}`]}`}>
                {products.map((product) => (
                  <ProductCard key={product.variantId ? `${product.id}-${product.variantId}` : product.id} product={product as any} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 py-4">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 font-medium text-sm transition"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl font-semibold text-sm transition ${
                          currentPage === pageNum
                            ? 'bg-[#F99205] text-white shadow-sm'
                            : 'border border-stone-300 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 font-medium text-sm transition"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
