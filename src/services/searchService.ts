import { api } from './api';
import {
  PopularSearchesResponse,
  RecentSearchesResponse,
  SearchFiltersResponse,
  SearchQuery,
  SearchResponse,
  SearchSuggestionsResponse,
  TrendingSearchesResponse,
} from '@/types/search';

export const searchService = {
  /**
   * GET /api/v1/search
   * Full-text product search with dynamic filtering and sorting
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const params = new URLSearchParams();
    params.set('q', query.q);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.categoryId) params.set('categoryId', query.categoryId);
    if (query.priceMin !== undefined) params.set('priceMin', String(query.priceMin));
    if (query.priceMax !== undefined) params.set('priceMax', String(query.priceMax));
    if (query.petSpecies) params.set('petSpecies', query.petSpecies.toLowerCase());
    if (query.diet) params.set('diet', query.diet.toLowerCase());
    if (query.sort) params.set('sort', query.sort);
    if (query.brand) params.set('brand', query.brand);

    const qs = params.toString();
    return api<SearchResponse>(`/search?${qs}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/search/suggestions?q=...
   * Autocomplete typeahead suggestions with keywords and top product matches
   */
  async getSuggestions(q: string): Promise<SearchSuggestionsResponse> {
    const query = new URLSearchParams({ q }).toString();
    return api<SearchSuggestionsResponse>(`/search/suggestions?${query}`, { method: 'GET' });
  },

  /**
   * GET /api/v1/search/recent
   * Fetch authenticated user's recent searches
   */
  async getRecentSearches(): Promise<RecentSearchesResponse> {
    return api<RecentSearchesResponse>('/search/recent', { method: 'GET' });
  },

  /**
   * DELETE /api/v1/search/recent/:queryId
   * Delete a specific search query from user history
   */
  async deleteRecentSearch(queryId: string): Promise<{ success: boolean; message: string }> {
    return api<{ success: boolean; message: string }>(`/search/recent/${encodeURIComponent(queryId)}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/v1/search/trending
   * Fetch global trending search keywords
   */
  async getTrendingSearches(): Promise<TrendingSearchesResponse> {
    return api<TrendingSearchesResponse>('/search/trending', { method: 'GET' });
  },

  /**
   * GET /api/v1/search/popular
   * Fetch globally popular historical queries
   */
  async getPopularSearches(): Promise<PopularSearchesResponse> {
    return api<PopularSearchesResponse>('/search/popular', { method: 'GET' });
  },

  /**
   * GET /api/v1/search/filters
   * Fetch dynamic faceting facets (brands, prices, species, diets)
   */
  async getFilters(categoryId?: string): Promise<SearchFiltersResponse> {
    const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return api<SearchFiltersResponse>(`/search/filters${qs}`, { method: 'GET' });
  },
};
