"use client";

import Link from "next/link";

import { BannerCarousel } from "@/components/BannerCarousel";
import { Chapter } from "@/lib/markdown";
import { SectionsStructure } from "@/lib/sections-types";

interface HomeClientProps {
  chapters: Chapter[];
  structure: SectionsStructure;
}

export default function HomeClient({ chapters, structure }: HomeClientProps) {
  return (
    <>
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto md:px-20 px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Title - 1/3 of space */}
          <div className="w-full lg:w-[33.33%]">
            <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-[#C8D419] to-[#23B2A7] bg-clip-text text-transparent leading-tight font-gteesti-display">
              Buying AI
            </h1>
            <p className="mt-2 text-base lg:text-2xl text-white/90 font-gteesti-pro-display">
              Tips and tools for the public sector
            </p>
          </div>

          {/* Right: Section Cards - 2/3 of space */}
          <div className="w-full lg:w-[66.66%]">
            <BannerCarousel structure={structure} />
          </div>
        </div>
      </div>

      {/* Chapter List */}
      {/* <div className="max-w-7xl mx-auto px-20 py-12">
        <nav>
          <ol className="space-y-3">
            {chapters.map((chapter) => (
              <li key={chapter.slug}>
                <Link
                  href={`/chapter/${chapter.slug}`}
                  className="block p-4 border border-white/10 rounded hover:bg-white/5 hover:border-white/20 transition-colors"
                >
                  <span className="text-sm text-white/60 font-mono">
                    {chapter.order.toString().padStart(2, "0")}
                  </span>
                  <h2 className="text-lg font-medium text-white mt-1">
                    {chapter.title}
                  </h2>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div> */}
    </>
  );
}
