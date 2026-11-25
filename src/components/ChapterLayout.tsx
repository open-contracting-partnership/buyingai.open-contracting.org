"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  formatSectionNumber,
  getChapterInSection,
  getSectionColor,
  type SectionsStructure,
} from "@/lib/sections-types";
import { StickyNavbar } from "./StickyNavbar";

// Helper function to convert hex color to rgba with opacity
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Scroll to the URL's fragment, below the sticky header (117px) and navbar (60px), with a margin.
function scrollToHash() {
  const hash = window.location.hash;
  const targetElement = hash && document.getElementById(hash.substring(1));
  if (targetElement) {
    window.scrollTo({
      top: targetElement.getBoundingClientRect().top + window.pageYOffset - 200,
      behavior: "smooth",
    });
  }
}

interface ChapterLayoutProps {
  currentSlug: string;
  children: React.ReactNode;
  structure: SectionsStructure;
}

export function ChapterLayout({ currentSlug, children, structure }: ChapterLayoutProps) {
  // Number the saved PDF by the chapter's position in the TOC, so that downloads sort in reading order.
  const order = getChapterInSection(structure, currentSlug)?.chapter.order;
  const downloadName = order
    ? `buyingai-${order.toString().padStart(2, "0")}-${currentSlug.replace(/^\d+-/, "")}.pdf`
    : `buyingai-${currentSlug}.pdf`;
  // Always show sticky nav on chapter pages (start with true)
  const [showStickyNav, setShowStickyNav] = useState(true);
  // Always start with false to avoid hydration mismatch, will be set correctly in useEffect
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show the sidebar on desktop, and hide it on mobile.
  useEffect(() => {
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  // Check for hash on mount and scroll to position
  useEffect(() => {
    if (window.location.hash) {
      setShowStickyNav(true);
      // Wait for the page to render.
      setTimeout(scrollToHash, 100);
    }
  }, [currentSlug]);

  // Handle hash changes (e.g., when clicking anchor links)
  useEffect(() => {
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Save scroll position when navigating
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      sessionStorage.setItem("toc-scroll-position", nav.scrollTop.toString());
    };

    nav.addEventListener("scroll", handleScroll);
    return () => nav.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore scroll position and scroll active item into view
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeItem = nav.querySelector(`[data-chapter-slug="${currentSlug}"]`) as HTMLElement;

    if (activeItem) {
      // Check if the active item is already in view
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const isInView = itemRect.top >= navRect.top && itemRect.bottom <= navRect.bottom;

      // If not in view, scroll it into view (this maintains context)
      if (!isInView) {
        // First restore saved position to maintain context
        const savedScroll = sessionStorage.getItem("toc-scroll-position");
        if (savedScroll) {
          nav.scrollTop = parseInt(savedScroll, 10);
        }

        // Then scroll the active item into view with a small delay
        setTimeout(() => {
          activeItem.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 50);
      }
    } else {
      // If active item not found, restore saved position
      const savedScroll = sessionStorage.getItem("toc-scroll-position");
      if (savedScroll) {
        nav.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, [currentSlug]);

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

      <div className="flex relative">
        {/* Overlay for mobile when sidebar is open */}
        {isMounted && sidebarVisible && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} aria-hidden="true" />
        )}

        {/* Sidebar - Fixed on mobile, sticky on desktop */}
        <aside
          ref={sidebarRef}
          className={`bg-white border-r border-gray-200 transition-all duration-300 h-screen z-50 ${
            !isMounted
              ? "w-[366px] fixed top-[117px] translate-x-0 lg:sticky"
              : sidebarVisible
                ? "w-[366px] fixed top-[117px] translate-x-0 lg:sticky"
                : "fixed top-[117px] w-full -translate-x-full overflow-hidden lg:sticky lg:w-0 lg:translate-x-0"
          }`}
        >
          <div className="">
            <div className="flex">
              <div className="shrink p-4 border-r border-[#3D393D]/20">
                {/* Close Button - Top left corner */}
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="size-5 rounded-full bg-[#92C36F] grid place-items-center text-white transition-colors z-10 cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <svg
                    aria-hidden="true"
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
              <div className="flex-1">
                <div className="p-5">
                  <p className="text-base font-medium text-black">Table of content</p>
                </div>
                <nav
                  ref={navRef}
                  aria-label="Table of contents"
                  className="space-y-0 max-h-[calc(100vh-240px)] overflow-y-auto overscroll-contain"
                >
                  {structure.sections.map((section) => {
                    const isActiveSection = section.chapters.some((ch) => ch.slug === currentSlug);
                    const color = getSectionColor(section.number);

                    return (
                      <div key={section.number} className="relative p-1">
                        {/* Section Header */}
                        <div className={`flex items-center py-3 px-4 ${isActiveSection ? "" : ""}`}>
                          {/* Active Section Indicator Bar */}
                          {isActiveSection && (
                            <div
                              className="w-2 h-10 rounded-tr-lg rounded-br-lg flex-shrink-0 absolute left-0"
                              style={{ backgroundColor: color.bg }}
                            ></div>
                          )}

                          {/* Section Number and Title */}
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-gteesti-display text-black mr-2 ${
                                isActiveSection ? "font-bold" : "font-medium"
                              }`}
                            >
                              {formatSectionNumber(section.number)}
                            </span>
                            <span
                              className={`text-sm font-gteesti-display text-black ${
                                isActiveSection ? "font-bold" : "font-medium"
                              }`}
                            >
                              {section.title}
                            </span>
                          </div>
                        </div>

                        {/* Section Chapters - Always show all chapters */}
                        <ul className="space-y-1 ml-6 border-l border-black">
                          {section.chapters.map((ch) => {
                            const isActiveChapter = ch.slug === currentSlug;
                            return (
                              <li key={ch.slug}>
                                <Link
                                  href={`/chapter/${ch.slug}#content`}
                                  scroll={false}
                                  data-chapter-slug={ch.slug}
                                  className={`block px-3 py-2 text-sm transition-colors rounded ${
                                    isActiveChapter
                                      ? "font-medium"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                  }`}
                                  style={
                                    isActiveChapter
                                      ? {
                                          backgroundColor: hexToRgba(color.bg, 0.19),
                                        }
                                      : undefined
                                  }
                                >
                                  <div className="flex items-center">
                                    <span>{ch.title}</span>
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content, in the layout's main element */}
        <div className="transition-all duration-300 w-full lg:flex-1">
          <div className="min-h-screen">
            <div
              id="content"
              className="px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 pb-8 sm:pb-12 transition-all duration-300 w-full lg:max-w-4xl lg:mx-auto"
              style={{ scrollMarginTop: "200px" }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <a
        href={`/pdfs/${currentSlug}.pdf`}
        download={downloadName}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#D6E100] text-black rounded-full shadow-lg hover:bg-[#B5C115] transition-all duration-300 hover:shadow-xl no-print cursor-pointer"
        aria-label="Download chapter (PDF)"
      >
        <Download className="size-5" />
        <span className="hidden sm:inline font-medium">Download chapter (PDF)</span>
      </a>
    </div>
  );
}
