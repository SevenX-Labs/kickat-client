"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Clock, Tag } from "lucide-react";
import { Footer } from "@/components/common/Footer";

const PREVIEW_BLOGS = [
  {
    id: "dog-grooming-guide",
    slug: "10-essential-grooming-tips-for-dogs",
    title: "10 Essential Grooming & Hygiene Tips for Dogs",
    category: "DOG CARE",
    readTime: "5 min read",
    date: "Coming Soon",
    excerpt: "Discover the best practices for keeping your dog's coat shiny, skin healthy, and nails trimmed with expert grooming routines.",
    image: "/hero-products/dog_food.png",
  },
  {
    id: "cat-nutrition-101",
    slug: "understanding-cat-nutrition",
    title: "Understanding Cat Nutrition: How to Choose the Right Food",
    category: "CAT HEALTH",
    readTime: "4 min read",
    date: "Coming Soon",
    excerpt: "Learn how to balance proteins, hydration, and essential vitamins to support your cat's lifelong health and energy levels.",
    image: "/hero-products/cat_treats.png",
  },
  {
    id: "aquarium-care-tips",
    slug: "aquarium-maintenance-101",
    title: "Aquarium Maintenance 101: Crystal Clear Water Secrets",
    category: "AQUATICS",
    readTime: "6 min read",
    date: "Coming Soon",
    excerpt: "Simple daily and weekly water testing, filtration checks, and care steps to keep your tropical fish thriving.",
    image: "/hero-products/pet_bowl.png",
  },
];

export default function BlogsPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#1A1612]">
      {/* Main Content Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 md:py-16">
        
        {/* Temporary Notice Banner */}
        <div className="bg-gradient-to-r from-[#FFF5ED] via-[#FFF9F2] to-[#FFF5ED] border border-[#FD802E]/30 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-sm mb-16 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 bg-[#FD802E]/10 text-[#FD802E] font-bold text-xs md:text-sm px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={16} />
            <span>New Blogs Will Come Soon</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1A1612] tracking-tight mb-4 font-serif">
            The <em className="italic text-[#FD802E]">KickAt</em> Journal
          </h1>

          <p className="text-sm md:text-base text-[#666055] max-w-xl mx-auto leading-relaxed">
            Our editorial team is crafting expert pet care guides, nutrition insights, and training tips. Full articles will be published shortly!
          </p>
        </div>

        {/* Blog Teasers Preview Grid */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1A1612]">Upcoming Article Previews</h2>
              <p className="text-xs md:text-sm text-[#78746D] mt-1">Clicking an article opens it in a separate tab</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#888276]">
              <BookOpen size={16} />
              <span>3 Articles Preview</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PREVIEW_BLOGS.map((blog) => (
              <a
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#FFFFFF] border border-[#EBE5DB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#FD802E] transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Thumbnail Image */}
                <div className="relative h-48 w-full bg-[#FAF6F0] overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#1A1612]/80 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {blog.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-[#888276] mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {blog.readTime}
                      </span>
                      <span>•</span>
                      <span className="text-[#FD802E] font-semibold">{blog.date}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1A1612] group-hover:text-[#FD802E] transition-colors leading-snug mb-3 font-serif">
                      {blog.title}
                    </h3>

                    <p className="text-xs md:text-sm text-[#555046] line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F3ECE1] flex items-center justify-between text-xs font-bold text-[#FD802E]">
                    <span>Read Preview</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
