"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { Footer } from "@/components/common/Footer";

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

export default function SingleBlogPage({ params }: SingleBlogPageProps) {
  const resolvedParams = React.use(params);
  const slugTitle = resolvedParams.slug.replace(/-/g, " ");

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#1A1612]">
      {/* Main Content Article */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-16">
        
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#78746D] hover:text-[#FD802E] mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to KickAt Journal
        </Link>

        {/* Temporary Notice Banner */}
        <div className="bg-[#FFF5ED] border border-[#FD802E]/30 rounded-2xl p-6 mb-10 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 text-[#FD802E] font-bold text-xs md:text-sm mb-2">
            <Sparkles size={16} />
            <span>New Blogs Will Come Soon</span>
          </div>
          <p className="text-xs md:text-sm text-[#666055]">
            This article is currently undergoing final editorial review. Full published content will be available shortly!
          </p>
        </div>

        {/* Article Header */}
        <article className="bg-[#FFFFFF] border border-[#EBE5DB] rounded-3xl p-6 md:p-12 shadow-sm">
          
          <div className="flex items-center gap-3 text-xs text-[#888276] mb-4">
            <span className="bg-[#1A1612] text-white font-bold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
              PET CARE
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> 5 min read
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-[#1A1612] leading-tight mb-6 font-serif capitalize">
            {slugTitle}
          </h1>

          <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden mb-8 bg-[#FAF6F0]">
            <Image
              src="/hero-products/dog_food.png"
              alt={slugTitle}
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-stone max-w-none text-sm md:text-base text-[#555046] leading-relaxed space-y-6">
            <p className="text-lg font-medium text-[#1A1612]">
              Providing your pet with proper care, balanced nutrition, and an engaging environment is essential for a long, happy life.
            </p>

            <h2 className="text-xl font-bold text-[#1A1612] font-serif pt-4">
              1. Consistent Routines Matter
            </h2>
            <p>
              Pets thrive on predictability. Establishing regular feeding times, grooming sessions, and play hours helps reduce stress and promotes emotional well-being.
            </p>

            <h2 className="text-xl font-bold text-[#1A1612] font-serif pt-4">
              2. Tailored Nutrition
            </h2>
            <p>
              Every pet has unique dietary requirements based on breed, age, and activity level. Always choose high-quality formulas rich in essential proteins and healthy fats.
            </p>

            {/* Sub-Article / Related Post Link (Opens in New Tab) */}
            <div className="my-8 p-6 bg-[#FAF6F0] rounded-2xl border border-[#EBE5DB]">
              <span className="text-xs font-bold text-[#FD802E] uppercase tracking-wider block mb-2">Read Next</span>
              <a
                href="/blogs/understanding-cat-nutrition"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between text-base font-bold text-[#1A1612] hover:text-[#FD802E] transition-colors"
              >
                <span>Understanding Cat Nutrition: How to Choose the Right Food</span>
                <ExternalLink size={16} className="text-[#FD802E] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <p className="italic text-[#78746D] text-xs md:text-sm">
              Note: Full comprehensive guides and downloadable PDF pet care checklists will be released with our upcoming blog launch. Stay tuned!
            </p>
          </div>

        </article>

      </main>

      <Footer />
    </div>
  );
}
