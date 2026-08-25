import { Hero } from "@/components/common/Hero";
import { TrustStrip } from "@/components/common/TrustStrip";
import { PetCategories } from "@/components/common/PetCategories";
import { ShopByCategory } from "@/components/common/ShopByCategory";
import { BestSellers } from "@/components/common/BestSellers";
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
        <BestSellers />
        <WhyKickat />
        <CustomerReviews />
        <InstagramFeed />
      </main>
      <Footer />
    </div>
  );
}
