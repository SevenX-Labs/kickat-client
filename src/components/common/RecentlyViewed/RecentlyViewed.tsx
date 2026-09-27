"use client";

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { ProductRow } from '../ProductRow';
import { CatalogProduct } from '@/data/categoryData';

export function RecentlyViewed() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRecentlyViewed() {
      try {
        setIsLoading(true);
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
      title="Pick Up Where You Left Off"
      subtitle="Items you recently explored on KickAt."
      products={products}
      backgroundColor="white"
      viewAllLink="/shop"
    />
  );
}
