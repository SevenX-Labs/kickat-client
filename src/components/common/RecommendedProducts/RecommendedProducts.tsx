"use client";

import { useEffect, useState } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { ProductRow } from '../ProductRow';
import { mapBackendProductListToCards } from '@/types/product';
import { CatalogProduct } from '@/data/categoryData';
import { getAccessToken } from '@/services/api';

export function RecommendedProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [personalized, setPersonalized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommended() {
      const token = getAccessToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await recommendationService.getRecommended(8);
        if (isMounted && res && res.success && Array.isArray(res.products) && res.products.length > 0) {
          const mapped = mapBackendProductListToCards(res.products) as unknown as CatalogProduct[];
          setProducts(mapped);
          setPersonalized(Boolean(res.personalized));
        } else if (isMounted) {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Could not fetch recommendations:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecommended();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <ProductRow
      eyebrow={personalized ? "For You" : "Trending Picks"}
      title={personalized ? "Suggested for You" : "Popular Picks"}
      subtitle={
        personalized
          ? "Curated recommendations based on your pet's tastes and activity."
          : "Top trending choices loved by pet parents across KickAt."
      }
      products={products}
      backgroundColor="cream"
      viewAllLink="/shop"
    />
  );
}
