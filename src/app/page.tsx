import { Hero } from "@/components/common/Hero";
import { TrustStrip } from "@/components/common/TrustStrip";
import { PetCategories } from "@/components/common/PetCategories";
import { ShopByCategory } from "@/components/common/ShopByCategory";
import { ProductRow } from "@/components/common/ProductRow";
import { CATALOG_PRODUCTS } from '@/data/categoryData';
import { WhyKickat } from "@/components/common/WhyKickat";
import { CustomerReviews } from "@/components/common/CustomerReviews";
import { InstagramFeed } from "@/components/common/InstagramFeed";
import { Footer } from "@/components/common/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full flex-col">
        <Hero />
        <TrustStrip />
        <PetCategories />
        <ShopByCategory />
        <ProductRow 
          eyebrow="Crowd Favorites" 
          title="Best Sellers" 
          products={CATALOG_PRODUCTS.slice(0, 4)} 
          backgroundColor="cream" 
        />
        <ProductRow 
          eyebrow="Highly Recommended" 
          title="Top Rated Products" 
          products={CATALOG_PRODUCTS.slice(4, 8)} 
          backgroundColor="white" 
        />
        <ProductRow 
          eyebrow="KickAt Certified" 
          title="Most Trusted" 
          products={CATALOG_PRODUCTS.slice(8, 12)} 
          backgroundColor="cream" 
        />
        <ProductRow 
          eyebrow="Pick up where you left off" 
          title="Recently Viewed" 
          products={CATALOG_PRODUCTS.slice(12, 16)} 
          backgroundColor="white" 
        />
        <ProductRow 
          eyebrow="Trending Now" 
          title="Most Purchased" 
          products={CATALOG_PRODUCTS.slice(2, 6)} 
          backgroundColor="cream" 
        />
        <WhyKickat />
        <CustomerReviews />
        <InstagramFeed />
      </main>
      <Footer />
    </div>
  );
}
