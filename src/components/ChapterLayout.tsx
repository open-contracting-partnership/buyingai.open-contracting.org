"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/markdown";
import {
  SectionsStructure,
  getChapterInSection,
  getSectionColor,
} from "@/lib/sections-types";
import { StickyNavbar } from "./StickyNavbar";
import { BannerCarousel } from "./BannerCarousel";

interface ChapterLayoutProps {
  currentSlug: string;
  allChapters: Chapter[];
  children: React.ReactNode;
  chapterOrder: number;
  totalChapters: number;
  structure: SectionsStructure;
}

export function ChapterLayout({
  currentSlug,
  allChapters,
  children,
  chapterOrder,
  totalChapters,
  structure,
}: ChapterLayoutProps) {
  // Always initialize as false to avoid hydration mismatch
  const [scrolled, setScrolled] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const currentChapterInfo = getChapterInSection(structure, currentSlug);
  const currentSection = currentChapterInfo?.section;
  const sectionColor = currentSection
    ? getSectionColor(currentSection.number)
    : getSectionColor(1);

  // Check for #content hash on mount and scroll to position
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#content") {
      // Set states immediately for navbar/sidebar visibility
      setScrolled(true);
      setShowStickyNav(true);

      // Scroll to position after banner with smooth animation
      const scrollToContent = () => {
        window.scrollTo({
          top: 700,
          behavior: "smooth",
        });
      };

      // Small delay to ensure page is rendered before smooth scroll
      setTimeout(scrollToContent, 100);
    }
  }, [currentSlug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 400);
      // Show sticky nav after scrolling past the banner (header ~88px + hero ~600px)
      setShowStickyNav(scrollY > 650);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="min-h-screen bg-[#DBDADB]/20">
      {/* Sticky Navbar - appears on scroll */}
      <StickyNavbar
        structure={structure}
        currentSlug={currentSlug}
        visible={showStickyNav}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={toggleSidebar}
      />

      {/* Hero Section - Dynamic based on current chapter */}
      <div className="bg-[#3D393D] text-white">
        <div className="relative max-w-7xl mx-auto px-20 py-24">
          <div className="flex gap-12 items-center">
            {/* Left: Title - 1/3 of space */}
            <div className="w-[33.33%]">
              <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-[#23B2A7] to-[#C8D419] bg-clip-text text-transparent leading-tight">
                Buying AI
              </h1>
              <p className="text-2xl text-white/90">
                Tips and tools for the public sector
              </p>
            </div>

            {/* Right: Section Cards - 2/3 of space */}
            <BannerCarousel structure={structure} currentSlug={currentSlug} />
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Sidebar - Always takes space, becomes sticky after scrolling */}
        <aside
          className={`w-[366px] bg-white border-r border-gray-200 transition-all sticky z-50 top-[120px] duration-300 ${
            scrolled && sidebarVisible ? "sticky h-[calc(100vh-148px)]" : ""
          } ${
            sidebarVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-black">
                Table of content
              </h2>
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                aria-label="Hide sidebar"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto">
              {structure.sections.map((section) => {
                const hasCurrentChapter = section.chapters.some(
                  (ch) => ch.slug === currentSlug
                );
                const color = getSectionColor(section.number);

                return (
                  <div key={section.number} className="space-y-2">
                    <div
                      className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded inline-block"
                      style={{
                        backgroundColor: `${color.bg}30`,
                        color: color.bg,
                      }}
                    >
                      {section.number.toString().padStart(2, "0")} ·{" "}
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.chapters.map((ch) => (
                        <Link
                          key={ch.slug}
                          href={`/chapter/${ch.slug}#content`}
                          scroll={false}
                          className={`block px-4 py-2 rounded text-sm transition-colors ${
                            ch.slug === currentSlug
                              ? "text-black font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          style={
                            ch.slug === currentSlug
                              ? {
                                  backgroundColor: `${color.bg}20`,
                                }
                              : {}
                          }
                        >
                          <span className="text-xs opacity-60 font-mono mr-2">
                            {ch.order.toString().padStart(2, "0")}
                          </span>
                          {ch.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 max-w-7xl mx-auto ${
            scrolled ? "ml-0" : "ml-0"
          }`}
        >
          <div id="content" className="px-12 py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
