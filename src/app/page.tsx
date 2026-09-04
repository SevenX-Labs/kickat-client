import { Hero } from "@/components/common/Hero";
import { ShopByCategory } from "@/components/common/ShopByCategory";
import { ProductRow } from "@/components/common/ProductRow";
import { TrustStrip } from "@/components/common/TrustStrip";
import { WhyKickat } from "@/components/common/WhyKickat";
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import { CustomerReviews } from "@/components/common/CustomerReviews";
import { FAQ } from "@/components/common/FAQ";
import { InstagramFeed } from "@/components/common/InstagramFeed";
import { Footer } from "@/components/common/Footer";

export default function Home() {
  // Deduped product selections — zero overlap between rows
  const bestSellers = CATALOG_PRODUCTS.filter(p => ['d-1', 'd-2', 'd-3', 'd-4'].includes(p.id));
  const newArrivals = CATALOG_PRODUCTS.filter(p => ['c-1', 'c-2', 'c-3', 'c-4'].includes(p.id));

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full flex-col">
        {/* 1. Hero */}
        <Hero />

        {/* 2. Shop by Category (Immediately after Hero) */}
        <ShopByCategory />

        {/* 3. Best Sellers */}
        <ProductRow 
          eyebrow="Crowd Favorites" 
          title="Best Sellers" 
          products={bestSellers} 
          backgroundColor="cream" 
        />

        {/* 4. Compact Single-Row Trust & Delivery Strip */}
        <TrustStrip />

        {/* 5. New Arrivals */}
        <ProductRow 
          eyebrow="Just Dropped" 
          title="New Arrivals" 
          products={newArrivals} 
          backgroundColor="white" 
        />

        {/* 6 & 7. Why KickAt (Stats + Founder Story) */}
        <WhyKickat />

        {/* 8. Testimonials / Reviews */}
        <CustomerReviews />

        {/* 9. FAQ */}
        <FAQ />

        {/* 10. Instagram / Community Feed */}
        <InstagramFeed />
      </main>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
