"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Hero } from "@/components/common/Hero";
import { ShopByCategory } from "@/components/common/ShopByCategory";
import { ProductRow } from "@/components/common/ProductRow";
import { TrustStrip } from "@/components/common/TrustStrip";
import { productService } from '@/services/productService';
import { mapBackendProductToCard } from '@/types/product';
import { CatalogProduct } from '@/data/categoryData';

// Dynamic code-splitting for below-the-fold components
const WhyKickat = dynamic(() => import("@/components/common/WhyKickat").then(mod => mod.WhyKickat));
const RecentlyViewed = dynamic(() => import("@/components/common/RecentlyViewed").then(mod => mod.RecentlyViewed));
const CustomerReviews = dynamic(() => import("@/components/common/CustomerReviews").then(mod => mod.CustomerReviews));
const FAQ = dynamic(() => import("@/components/common/FAQ").then(mod => mod.FAQ));
const InstagramFeed = dynamic(() => import("@/components/common/InstagramFeed").then(mod => mod.InstagramFeed));
const Footer = dynamic(() => import("@/components/common/Footer").then(mod => mod.Footer));

export default function Home() {
  const [bestSellers, setBestSellers] = useState<CatalogProduct[]>([]);
  const [trending, setTrending] = useState<CatalogProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeProducts() {
      // 1. Fetch Best Sellers
      try {
        const res = await productService.getBestSellers(4);
        if (isMounted && res && res.success && Array.isArray(res.products) && res.products.length > 0) {
          const mapped = res.products.map(mapBackendProductToCard) as unknown as CatalogProduct[];
          setBestSellers(mapped);
        }
      } catch (err) {
        console.warn('Failed to load best sellers:', err);
      }

      // 2. Fetch Trending Products
      try {
        const res = await productService.getTrending(4);
        if (isMounted && res && res.success && Array.isArray(res.products) && res.products.length > 0) {
          const mapped = res.products.map(mapBackendProductToCard) as unknown as CatalogProduct[];
          setTrending(mapped);
        }
      } catch (err) {
        console.warn('Failed to load trending products:', err);
      }

      // 3. Fetch New Arrivals
      try {
        const res = await productService.getNewArrivals(4);
        const list = res?.products;
        if (isMounted && list && Array.isArray(list) && list.length > 0) {
          const mapped = list.map(mapBackendProductToCard) as unknown as CatalogProduct[];
          setNewArrivals(mapped);
        }
      } catch (err) {
        console.warn('Failed to load new arrivals:', err);
      }
    }

    loadHomeProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full flex-col">
        {/* 1. Hero (Banners preserved without changes) */}
        <Hero />

        {/* 2. Shop by Category (Immediately after Hero) */}
        <ShopByCategory />

        {/* 3. Best Sellers (Live from GET /api/v1/products/best-sellers) */}
        {bestSellers.length > 0 && (
          <ProductRow 
            eyebrow="Crowd Favorites" 
            title="Best Sellers" 
            subtitle="Most loved and highest-rated essentials chosen by our pet parent community."
            products={bestSellers} 
            backgroundColor="cream" 
            viewAllLink="/shop"
          />
        )}

        {/* 4. Compact Single-Row Trust & Delivery Strip */}
        <TrustStrip />

        {/* 5. Trending Products (Live from GET /api/v1/products/trending) */}
        {trending.length > 0 && (
          <ProductRow 
            eyebrow="Trending This Week" 
            title="What's Hot" 
            subtitle="Fastest-moving treats, nutrition, and accessories flying off the shelves."
            products={trending} 
            backgroundColor="white" 
            viewAllLink="/shop"
          />
        )}

        {/* 6. New Arrivals (Live from GET /api/v1/products?sort=newest) */}
        {newArrivals.length > 0 && (
          <ProductRow 
            eyebrow="Just Dropped" 
            title="New Arrivals" 
            subtitle="The latest veterinarian-approved formulas, grooming care, and toys."
            products={newArrivals} 
            backgroundColor={trending.length > 0 ? "cream" : "white"} 
            viewAllLink="/shop"
          />
        )}

        {/* 7. Why KickAt (Stats + Founder Story) */}
        <WhyKickat />

        {/* 8. Recently Viewed (Live from GET /api/v1/users/me/recently-viewed) */}
        <RecentlyViewed />

        {/* 9. Testimonials / Reviews (Live from GET /api/v1/home/testimonials) */}
        <CustomerReviews />

        {/* 10. FAQ */}
        <FAQ />

        {/* 11. Instagram / Community Feed */}
        <InstagramFeed />
      </main>

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
