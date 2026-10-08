"use client";

import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { BackendProduct } from '@/types/product';
import { RecentlyViewedItem } from '@/types/recommendation';
import { getAccessToken } from '@/services/api';

export function useRecommended(limit: number = 10) {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [personalized, setPersonalized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setProducts([]);
      setPersonalized(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await recommendationService.getRecommended(limit);
      if (res && res.success && Array.isArray(res.products)) {
        setProducts(res.products);
        setPersonalized(Boolean(res.personalized));
      } else {
        setProducts([]);
        setPersonalized(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load recommendations');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    products,
    personalized,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}

export function useRecentlyViewed(limit: number = 10) {
  const [products, setProducts] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyViewed = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await recommendationService.getRecentlyViewed(limit);
      if (res && res.success && Array.isArray(res.products)) {
        setProducts(res.products);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load recently viewed products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentlyViewed();

    const handleUpdate = () => {
      fetchRecentlyViewed();
    };
    window.addEventListener('recently-viewed-updated', handleUpdate);
    return () => {
      window.removeEventListener('recently-viewed-updated', handleUpdate);
    };
  }, [fetchRecentlyViewed]);

  return {
    products,
    loading,
    error,
    refetch: fetchRecentlyViewed,
  };
}

export function useRecordActivity() {
  const recordSearch = useCallback((query: string) => {
    recommendationService.recordSearch(query);
  }, []);

  const recordView = useCallback((productId: string) => {
    recommendationService.recordView(productId);
  }, []);

  return { recordSearch, recordView };
}
