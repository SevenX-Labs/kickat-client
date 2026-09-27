export type SearchSort = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';

export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  petSpecies?: string;
  diet?: string;
  sort?: SearchSort;
  brand?: string;
}

export interface SearchProductItem {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number | null;
  brand?: string | null;
  petSpecies?: string | null;
  dietaryPreference?: string | null;
  imageUrl?: string | null;
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  products: SearchProductItem[];
}

export interface SearchSuggestionsResponse {
  success: boolean;
  query: string;
  suggestions: {
    keywords: string[];
    topProducts: Array<{
      id: string;
      name: string;
      price: number;
      imageUrl?: string | null;
      category?: string | null;
    }>;
  };
}

export interface RecentSearchItem {
  id: string;
  query: string;
  createdAt: string;
}

export interface RecentSearchesResponse {
  success: boolean;
  recentSearches: RecentSearchItem[];
}

export interface TrendingSearchesResponse {
  success: boolean;
  trendingSearches: string[];
}

export interface PopularSearchesResponse {
  success: boolean;
  popularSearches: Array<{
    query: string;
    searchCount: number;
  }>;
}

export interface SearchFiltersResponse {
  success: boolean;
  filters: {
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
    petSpecies: string[];
    dietaryPreferences: string[];
    sortOptions: string[];
  };
}
