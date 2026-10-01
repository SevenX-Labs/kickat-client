"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Tag, AlertCircle, Loader2 } from "lucide-react";
import { Footer } from "@/components/common/Footer";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import SafeImage from "@/components/ui/SafeImage";

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

export default function SingleBlogPage({ params }: SingleBlogPageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await blogService.getBlogBySlug(slug);
        if (res && res.success && res.blog) {
          setBlog(res.blog);
        } else {
          setError("Article not found.");
        }
      } catch (err: any) {
        console.error("Failed to load article from server:", err);
        setError("The requested article could not be found or has not been published yet.");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#1A1612]">
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <Loader2 size={36} className="animate-spin mx-auto text-[#F99205] mb-4" />
          <p className="text-sm font-semibold text-[#888276]">Loading article content...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#1A1612]">
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center">
          <AlertCircle size={44} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-sm text-[#78746D] mb-6">{error || "The requested journal article does not exist."}</p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1612] text-white rounded-xl text-xs font-bold hover:bg-[#F99205] transition-colors"
          >
            <ArrowLeft size={16} /> Back to KickAt Journal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = blog?.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently Published";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#1A1612]">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-16">
        
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#78746D] hover:text-[#F99205] mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to KickAt Journal
        </Link>

        {/* Article Header & Body */}
        {blog && (
          <article className="bg-[#FFFFFF] border border-[#EBE5DB] rounded-3xl p-6 md:p-12 shadow-sm">
            
            {/* Category & Read Time Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#888276] mb-4">
              {blog.category && (
                <span className="bg-[#1A1612] text-white font-bold text-[10px] uppercase px-3 py-1 rounded-full tracking-wider">
                  {blog.category}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={13} /> {blog.readTimeMinutes || 4} min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {formattedDate}
              </span>
              {blog.authorName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User size={13} /> {blog.authorName}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#1A1612] leading-tight mb-6 font-serif">
              {blog.title}
            </h1>

            {/* Cover Image */}
            {blog.coverImage && (
              <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden mb-8 bg-[#FAF6F0]">
                <SafeImage
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  priority
                  className="object-cover"
                  productName={blog.title}
                  categoryName={blog.category || undefined}
                />
              </div>
            )}

            {/* Summary Excerpt */}
            {blog.summary && (
              <div className="p-4 md:p-6 bg-[#FAF6F0] rounded-2xl border-l-4 border-[#F99205] text-[#555046] text-base font-medium italic mb-8">
                {blog.summary}
              </div>
            )}

            {/* Article Content */}
            {blog.content && (
              <div className="prose prose-stone max-w-none text-sm md:text-base text-[#555046] leading-relaxed space-y-6">
                {blog.content.split("\n\n").map((paragraph, idx) => {
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h2 key={idx} className="text-xl md:text-2xl font-bold text-[#1A1612] font-serif pt-4">
                        {paragraph.replace("### ", "")}
                      </h2>
                    );
                  }
                  return (
                    <p key={idx}>
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-[#F3ECE1] flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#888276] mr-2 flex items-center gap-1">
                  <Tag size={13} /> Tags:
                </span>
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#FAF6F0] border border-[#EBE5DB] text-[#555046] text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

          </article>
        )}

      </main>

      <Footer />
    </div>
  );
}
