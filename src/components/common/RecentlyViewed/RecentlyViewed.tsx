"use client";

import { useEffect, useState } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { userService } from '@/services/userService';
import { ProductRow } from '../ProductRow';
import { mapBackendProductListToCards } from '@/types/product';
import { CatalogProduct } from '@/data/categoryData';
import { getAccessToken } from '@/services/api';

export function RecentlyViewed() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecentlyViewed() {
      try {
        setIsLoading(true);
        const token = getAccessToken();

        // If authenticated, fetch from recommendation API /customer/products/recently-viewed
        if (token) {
          const res = await recommendationService.getRecentlyViewed(10);
          if (isMounted && res && res.success && Array.isArray(res.products) && res.products.length > 0) {
            const mapped = mapBackendProductListToCards(res.products) as unknown as CatalogProduct[];
            setProducts(mapped);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to local user service storage
        const data = await userService.getRecentlyViewed();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const mapped: CatalogProduct[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            price: Number(item.discountPrice ?? item.price ?? 0),
            originalPrice: item.discountPrice ? Number(item.price) : undefined,
            rating: Number(item.rating) || 4.8,
            reviewsCount: 24,
            image: item.imageUrl || '/hero-products/dog_food.png',
            images: [item.imageUrl || '/hero-products/dog_food.png'],
            mainCategory: 'Recently Viewed',
            subCategory: 'Essentials',
            brand: 'KickAt',
            tags: ['Recently Viewed'],
            badge: undefined,
            description: item.name,
          }));
          setProducts(mapped);
        } else if (isMounted) {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Could not fetch recently viewed items:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRecentlyViewed();

    const handleUpdate = () => {
      loadRecentlyViewed();
    };
    window.addEventListener('recently-viewed-updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('recently-viewed-updated', handleUpdate);
    };
  }, []);

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <ProductRow
      eyebrow="Recently Viewed"
      title="Pick Up Where You Left"
      subtitle="Items you recently explored on KickAt."
      products={products}
      backgroundColor="white"
      viewAllLink="/shop"
    />
  );
}
