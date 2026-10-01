"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Clock, Search, Loader2 } from "lucide-react";
import { Footer } from "@/components/common/Footer";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import SafeImage from "@/components/ui/SafeImage";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load Categories from Server
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await blogService.getBlogCategories();
        if (res && res.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.warn("Could not load blog categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Load Blogs from Server
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.getBlogs({
        page,
        limit: 9,
        category: activeCategory !== "All" ? activeCategory : undefined,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      });

      const fetchedList = res?.data || res?.blogs || [];
      setBlogs(fetchedList);
      if (res?.meta) {
        setTotalPages(res.meta.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch blogs from API:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const categoryPills = ["All", ...categories];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#1A1612]">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-14">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#888276] mb-6">
          <Link href="/" className="hover:text-[#F99205] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1A1612]">KickAt Journal</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1A1612] to-[#2E2822] text-white rounded-3xl p-8 md:p-14 shadow-lg mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#F99205]/20 text-[#F99205] text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider border border-[#F99205]/30">
              <Sparkles size={14} />
              <span>Pet Care & Expert Insights</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 font-serif leading-tight">
              The KickAt Journal
            </h1>
            <p className="text-sm md:text-base text-[#D4CDC3] leading-relaxed mb-6">
              Expert advice, nutrition tips, training guides, and wellness secrets curated by veterinarians and certified pet care specialists.
            </p>

            {/* Search Input in Hero */}
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888276]" />
              <input
                type="text"
                placeholder="Search pet care articles, nutrition tips..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-[#1A1612] placeholder-[#888276] text-sm font-medium outline-none border border-transparent focus:border-[#F99205] shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categoryPills.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categoryPills.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory.toUpperCase() === cat.toUpperCase()
                    ? "bg-[#F99205] text-white shadow-sm"
                    : "bg-[#FFFFFF] text-[#78746D] border border-[#EBE5DB] hover:border-[#1A1612] hover:text-[#1A1612]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1A1612]">
                {activeCategory === "All" ? "Latest Articles" : `${activeCategory} Articles`}
              </h2>
              <p className="text-xs md:text-sm text-[#78746D] mt-1">
                {blogs.length} {blogs.length === 1 ? "article" : "articles"} available
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#888276]">
              <BookOpen size={16} />
              <span>Verified Content</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[#EBE5DB] rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white border border-[#EBE5DB] rounded-2xl p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-[#F99205]" />
              <h3 className="text-lg font-bold text-[#1A1612] mb-2">No Articles Found</h3>
              <p className="text-sm text-[#78746D] mb-4">
                {searchQuery
                  ? "We could not find any articles matching your search query."
                  : "There are currently no published articles available in this category."}
              </p>
              {(searchQuery || activeCategory !== "All") && (
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 bg-[#1A1612] text-white rounded-xl text-xs font-bold hover:bg-[#F99205] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => {
                const formattedDate = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="group bg-[#FFFFFF] border border-[#EBE5DB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#F99205] transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-48 w-full bg-[#FAF6F0] overflow-hidden">
                      <SafeImage
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        productName={blog.title}
                        categoryName={blog.category || undefined}
                      />
                      {blog.category && (
                        <span className="absolute top-3 left-3 bg-[#1A1612]/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                          {blog.category}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-[#888276] mb-3">
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> {blog.readTimeMinutes || 4} min read
                          </span>
                          <span>•</span>
                          <span className="text-[#F99205] font-semibold">{formattedDate}</span>
                        </div>

                        <h3 className="text-lg font-bold text-[#1A1612] group-hover:text-[#F99205] transition-colors leading-snug mb-3 font-serif line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-xs md:text-sm text-[#555046] line-clamp-3 leading-relaxed">
                          {blog.summary || (blog.content ? blog.content.replace(/<[^>]+>/g, '').slice(0, 140) + "..." : "")}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F3ECE1] flex items-center justify-between text-xs font-bold text-[#F99205]">
                        <span>Read Full Guide</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-[#EBE5DB] bg-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-xs font-semibold text-[#888276]">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-[#EBE5DB] bg-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
