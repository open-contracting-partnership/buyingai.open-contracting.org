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
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { SectionMarker } from "./SectionMarker";

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
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // Sidebar visible by default only on desktop
    }
    return true; // Assume visible during SSR/hydration, will correct on client
  });

  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);

    // On mount: force-check once for client viewport width
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use intersection observer hook
  const activeSectionId = useIntersectionObserver({
    threshold: 0.01,
    rootMargin: "0px 0px -50% 0px",
    currentSlug,
  });

  // Debug log for activeSectionId
  useEffect(() => {
    console.log("Active section ID:", activeSectionId);
  }, [activeSectionId]);

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
    <div className="min-h-screen bg-[#EFEEEF]">
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
        <div className="relative max-w-7xl mx-auto lg:px-20 px-6 py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left: Title - 1/3 of space */}
            <div className="w-full lg:w-[33.33%]">
              <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-[#C8D419] to-[#23B2A7] bg-clip-text text-transparent leading-tight font-gteesti-display">
                Buying AI
              </h1>
              <p className="mt-2 text-base md:text-2xl text-white/90 font-gteesti-pro-display">
                Tips and tools for the public sector
              </p>
            </div>

            {/* Right: Section Cards - 2/3 of space */}
            <div className="w-full lg:w-[66.66%]">
              <BannerCarousel structure={structure} currentSlug={currentSlug} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Overlay for mobile when sidebar is open */}
        {sidebarVisible && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Sidebar - Fixed on mobile, sticky on desktop */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 h-screen z-50 ${
            sidebarVisible
              ? "w-[366px] fixed top-[119px] translate-x-0 lg:sticky"
              : "fixed top-[119px] w-full -translate-x-full overflow-hidden lg:sticky lg:w-0 lg:translate-x-0"
          }`}
        >
          <div className="">
            <div className="flex">
              <div className="shrink p-4 border-r border-[#3D393D]/20">
                {/* Close Button - Top left corner */}
                <button
                  onClick={toggleSidebar}
                  className="size-8 rounded-full bg-[#92C36F] grid place-items-center text-white transition-colors z-10 cursor-pointer"
                  aria-label="Close sidebar"
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
              <div className="p-5 flex-1">
                <div className="mb-6">
                  <h2 className="text-base font-gteesti-display font-medium text-black">
                    Table of content
                  </h2>
                </div>
                <nav className="space-y-0 max-h-[calc(100vh-240px)] overflow-y-auto">
                  {structure.sections.map((section) => {
                    // Check if this section is active based on intersection observer or current chapter
                    const hasCurrentChapter = section.chapters.some(
                      (ch) => ch.slug === currentSlug
                    );
                    const isActiveSection =
                      hasCurrentChapter ||
                      (activeSectionId &&
                        section.chapters.some(
                          (ch) => ch.slug === activeSectionId
                        ));
                    const color = getSectionColor(section.number);

                    return (
                      <div key={section.number} className="relative">
                        {/* Section Header */}
                        <div
                          className={`flex items-center py-3 px-4 ${
                            isActiveSection ? "bg-green-50" : ""
                          }`}
                        >
                          {/* Active Section Indicator Bar */}
                          {isActiveSection && (
                            <div className="w-1 h-8 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                          )}

                          {/* Section Number and Title */}
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-gteesti-display font-medium mr-2 ${
                                isActiveSection
                                  ? "text-green-600"
                                  : "text-black"
                              }`}
                            >
                              {section.number.toString().padStart(2, "0")}
                            </span>
                            <span
                              className={`text-sm font-gteesti-display font-medium ${
                                isActiveSection
                                  ? "text-green-600"
                                  : "text-black"
                              }`}
                            >
                              {section.title}
                            </span>
                          </div>
                        </div>

                        {/* Section Chapters - Always show all chapters */}
                        <div className="ml-4 space-y-1 pb-4">
                          {section.chapters.map((ch) => {
                            const isActiveChapter =
                              ch.slug === currentSlug ||
                              ch.slug === activeSectionId;
                            return (
                              <Link
                                key={ch.slug}
                                href={`/chapter/${ch.slug}#content`}
                                scroll={false}
                                className={`block px-3 py-2 text-sm transition-colors rounded ${
                                  isActiveChapter
                                    ? "bg-green-100 text-green-800 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                              >
                                <div className="flex items-center">
                                  <span>{ch.title}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="transition-all duration-300 w-full lg:flex-1">
          <SectionMarker sectionId={currentSlug}>
            <div
              id="content"
              className="px-6 lg:px-12 py-12 transition-all duration-300 w-full lg:max-w-4xl lg:mx-auto"
            >
              {children}
            </div>
          </SectionMarker>
        </main>
      </div>
    </div>
  );
}
