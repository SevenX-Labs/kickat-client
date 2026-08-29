"use client";

import { Footer } from "@/components/common/Footer";

export default function BlogsPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans bg-[#FDFBF7] min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-32 text-center px-4">
        <span className="text-[#E7A03B] font-bold uppercase tracking-widest text-sm mb-4">Coming Soon</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#211C15] mb-6">
          The <em className="italic text-[#E7A03B]">KickAt</em> Journal
        </h1>
        <p className="text-[#6B655C] max-w-lg mx-auto text-lg leading-relaxed">
          We are currently crafting beautiful, informative content about pet care, nutrition, and training. 
          Check back soon for our first series of articles!
        </p>
      </main>
      <Footer />
    </div>
  );
}
