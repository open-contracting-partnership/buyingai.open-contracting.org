"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/markdown";
import {
  SectionsStructure,
  getChapterInSection,
  getSectionColor,
} from "@/lib/sections-types";
import { StickyNavbar } from "./StickyNavbar";
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

  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

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

      // Scroll to content section (accounting for sticky header)
      const scrollToContent = () => {
        const contentElement = document.getElementById("content");
        if (contentElement) {
          const headerHeight = 119; // Height of sticky header
          const elementPosition = contentElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      };

      // Small delay to ensure page is rendered before smooth scroll
      setTimeout(scrollToContent, 100);
    }
  }, [currentSlug]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // No banner, so scrolled state triggers earlier
      setScrolled(scrollY > 50);

      // Show/hide navbar based on scroll direction (no banner threshold)
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollDirection = scrollY > lastScrollY ? "down" : "up";

          // Hide on scroll down, show on scroll up (only when scrolled)
          if (scrollY > 100) {
            if (scrollDirection === "down") {
              setShowStickyNav(false);
            } else {
              setShowStickyNav(true);
            }
          } else {
            // Hide when near top
            setShowStickyNav(false);
          }

          lastScrollY = scrollY > 0 ? scrollY : 0;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

    const activeItem = nav.querySelector(
      `[data-chapter-slug="${currentSlug}"]`
    ) as HTMLElement;

    if (activeItem) {
      // Check if the active item is already in view
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const isInView =
        itemRect.top >= navRect.top && itemRect.bottom <= navRect.bottom;

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
        {sidebarVisible && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Sidebar - Fixed on mobile, sticky on desktop */}
        <aside
          ref={sidebarRef}
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
                <nav
                  ref={navRef}
                  className="space-y-0 max-h-[calc(100vh-240px)] overflow-y-auto"
                >
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
                                data-chapter-slug={ch.slug}
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
              className="px-6 lg:px-12 pt-0 pb-12 transition-all duration-300 w-full lg:max-w-4xl lg:mx-auto"
              style={{ scrollMarginTop: "119px" }}
            >
              {children}
            </div>
          </SectionMarker>
        </main>
      </div>
    </div>
  );
}
