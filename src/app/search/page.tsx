"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ArrowLeft,
  Clock,
  TrendingUp,
  X,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { searchService } from '@/services/searchService';
import { SearchProductItem, SearchSort } from '@/types/search';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/common/ProductCard/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { mapBackendProductToCard } from '@/types/product';
import styles from './Search.module.css';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('categoryId') || '';

  const { isAuthenticated } = useAuth();

  // Search Input State
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  // Suggestions & Context
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<Array<{ id: string; query: string }>>([]);
  const [isDeletingRecent, setIsDeletingRecent] = useState<string | null>(null);

  // Results State
  const [products, setProducts] = useState<SearchProductItem[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SearchSort>('relevance');

  // Filters State
  const [availableFilters, setAvailableFilters] = useState<{
    brands: string[];
    priceRange: { min: number; max: number };
    petSpecies: string[];
    dietaryPreferences: string[];
  } | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedDiet, setSelectedDiet] = useState<string>('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Trending & Recent Searches on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadSearchContext() {
      try {
        const trendRes = await searchService.getTrendingSearches().catch(() => null);
        if (isMounted && trendRes && trendRes.trendingSearches) {
          setTrendingSearches(trendRes.trendingSearches);
        }

        if (isAuthenticated) {
          const recentRes = await searchService.getRecentSearches().catch(() => null);
          if (isMounted && recentRes && recentRes.recentSearches) {
            setRecentSearches(recentRes.recentSearches);
          }
        }
      } finally {
        if (isMounted) setIsInitialLoad(false);
      }
    }
    loadSearchContext();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // Load Dynamic Filters
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await searchService.getFilters(initialCategory || undefined);
        if (res.success && res.filters) {
          setAvailableFilters(res.filters);
        }
      } catch (err) {
        console.warn('Failed to load search filter facets:', err);
      }
    }
    fetchFilters();
  }, [initialCategory]);

  // Execute Search
  const performSearch = useCallback(
    async (searchTerm: string, page: number = 1, sort: SearchSort = sortBy) => {
      if (!searchTerm.trim()) {
        setActiveQuery('');
        setProducts([]);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      setError(null);
      setActiveQuery(searchTerm);

      try {
        const res = await searchService.search({
          q: searchTerm.trim(),
          page,
          limit: 12,
          sort,
          categoryId: initialCategory || undefined,
          brand: selectedBrand || undefined,
          petSpecies: selectedSpecies || undefined,
          diet: selectedDiet || undefined,
        });

        if (res.success) {
          setProducts(res.products || []);
          setTotalResults(res.pagination?.total || 0);
          setTotalPages(res.pagination?.totalPages || 1);
          setCurrentPage(res.pagination?.page || 1);
        } else {
          setProducts([]);
          setTotalResults(0);
        }
      } catch (err: any) {
        console.error('Search request failed:', err);
        setError(err?.message || 'Search failed. Please try again.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [initialCategory, selectedBrand, selectedSpecies, selectedDiet, sortBy]
  );

  // Sync with URL query parameter
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, 1, sortBy);
    }
  }, [initialQuery, performSearch, sortBy]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim(), 1, sortBy);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    setQuery(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
    performSearch(keyword, 1, sortBy);
  };

  const handleDeleteRecent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsDeletingRecent(id);
    try {
      await searchService.deleteRecentSearch(id);
      setRecentSearches((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.warn('Could not delete recent query:', err);
    } finally {
      setIsDeletingRecent(null);
    }
  };

  const handleSortChange = (newSort: SearchSort) => {
    setSortBy(newSort);
    if (activeQuery) {
      performSearch(activeQuery, 1, newSort);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      performSearch(activeQuery, newPage, sortBy);
    }
  };

  const hasActiveFilters = Boolean(selectedBrand || selectedSpecies || selectedDiet);

  const handleResetFilters = () => {
    setSelectedBrand('');
    setSelectedSpecies('');
    setSelectedDiet('');
    if (activeQuery) {
      performSearch(activeQuery, 1, sortBy);
    }
  };

  return (
    <main className={styles.main}>
      {/* Search Header Bar */}
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn} aria-label="Go Back">
          <ArrowLeft size={20} />
        </Link>
        <form className={styles.searchBar} onSubmit={handleFormSubmit}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for pet food, toys, bowls, vitamins..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) {
                setActiveQuery('');
                setProducts([]);
              }
            }}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setQuery('');
                setActiveQuery('');
                setProducts([]);
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </header>

      <div className={styles.container}>
        {/* State 1: No Query Entered (Show Recent & Trending Search Pills) */}
        {!activeQuery ? (
          <div>
            {recentSearches.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Clock size={18} color="#F99205" />
                  <span>Recent Searches</span>
                </h2>
                <div className={styles.pillContainer}>
                  {recentSearches.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.pill} ${styles.recentPill}`}
                      onClick={() => handleSelectKeyword(item.query)}
                    >
                      <span>{item.query}</span>
                      <button
                        type="button"
                        className={styles.pillDeleteBtn}
                        onClick={(e) => handleDeleteRecent(e, item.id)}
                        disabled={isDeletingRecent === item.id}
                        aria-label={`Remove ${item.query} from recent`}
                      >
                        {isDeletingRecent === item.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <TrendingUp size={18} color="#F99205" />
                <span>Trending Now</span>
              </h2>
              <div className={styles.pillContainer}>
                {(trendingSearches.length > 0
                  ? trendingSearches
                  : ['Dog food', 'Cat toys', 'Natural Chew', 'Stainless bowl', 'Leash & Harness']
                ).map((item) => (
                  <div
                    key={item}
                    className={styles.pill}
                    onClick={() => handleSelectKeyword(item)}
                  >
                    <Search size={13} color="#888" style={{ marginRight: 6 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Query Active (Show Live Search Results) */
          <div className={styles.section}>
            {/* Toolbar: Query summary & Sort Controls */}
            <div className={styles.resultsToolbar}>
              <div>
                <h2 className={styles.resultsTitle}>
                  Results for &ldquo;<span style={{ color: '#F99205' }}>{activeQuery}</span>&rdquo;
                </h2>
                <span className={styles.resultsCount}>
                  {isLoading ? 'Searching...' : `${totalResults} ${totalResults === 1 ? 'item' : 'items'} found`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Sort Dropdown */}
                <div className={styles.sortWrapper}>
                  <label htmlFor="search-sort" className={styles.sortLabel}>Sort by:</label>
                  <select
                    id="search-sort"
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SearchSort)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={18} color="#DC2626" />
                <span>{error}</span>
                <button
                  type="button"
                  className={styles.retryBtn}
                  onClick={() => performSearch(activeQuery, currentPage, sortBy)}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoading ? (
              <div className={styles.resultsGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <Skeleton style={{ height: 260, width: '100%', borderRadius: 16, marginBottom: 12 }} />
                    <Skeleton style={{ height: 20, width: '80%', marginBottom: 8 }} />
                    <Skeleton style={{ height: 16, width: '40%' }} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                {/* Products Grid */}
                <div className={styles.resultsGrid}>
                  {products.map((item) => {
                    const cardProduct = mapBackendProductToCard(item as any);
                    return <ProductCard key={item.id} product={cardProduct} />;
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className={styles.paginationRow}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    <div className={styles.pageIndicator}>
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-label="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty Search Results State */
              <div className={styles.emptyStateBox}>
                <div className={styles.emptyIconCircle}>
                  <Search size={32} color="#F99205" />
                </div>
                <h3 className={styles.emptyTitle}>No products found for &ldquo;{activeQuery}&rdquo;</h3>
                <p className={styles.emptySubtitle}>
                  Try checking your spelling, using more general search terms, or explore our curated categories.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link href="/category" className={styles.exploreCategoryBtn}>
                    <ShoppingBag size={16} />
                    <span>Explore All Categories</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
