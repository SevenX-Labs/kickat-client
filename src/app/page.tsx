import { Hero } from "@/components/common/Hero";
import { TrustStrip } from "@/components/common/TrustStrip";
import { WhyKickat } from "@/components/common/WhyKickat";
import { ShopByCategory } from "@/components/common/ShopByCategory";
import { ProductRow } from "@/components/common/ProductRow";
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
        <Hero />
        <TrustStrip />
        <WhyKickat />
        <ShopByCategory />
        <ProductRow 
          eyebrow="Crowd Favorites" 
          title="Best Sellers" 
          products={bestSellers} 
          backgroundColor="cream" 
        />
        <ProductRow 
          eyebrow="Just Dropped" 
          title="New Arrivals" 
          products={newArrivals} 
          backgroundColor="white" 
        />
        <CustomerReviews />
        <FAQ />
        <InstagramFeed />
      </main>
      <Footer />
    </div>
  );
}
