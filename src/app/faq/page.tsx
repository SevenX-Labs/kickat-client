"use client";

import { FAQ } from "@/components/common/FAQ";
import { Footer } from "@/components/common/Footer";

export default function FAQPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans bg-[#FDFBF7] min-h-screen pt-12">
      <main className="flex flex-1 w-full flex-col">
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
