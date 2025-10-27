"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SectionsStructure, getSectionColor } from "@/lib/sections-types";
import { ChevronRightIcon } from "lucide-react";

interface StickyNavbarProps {
  structure: SectionsStructure;
  currentSlug: string;
  visible: boolean;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export function StickyNavbar({
  structure,
  currentSlug,
  visible,
  sidebarVisible,
  onToggleSidebar,
}: StickyNavbarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // Find current section based on current slug
  const currentSectionNumber =
    structure.sections.find((section) =>
      section.chapters.some((ch) => ch.slug === currentSlug)
    )?.number || 1;

  return (
    <nav
      className={`fixed left-0 right-0 z-40 transition-opacity duration-300 bg-[#C8D419] ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        top: "119px", // Position below the main header
      }}
    >
      {/* Chapter Indicator Bar */}
      <div className="h-[60px] flex overflow-x-auto overflow-y-hidden scrollbar-hide">
        {/* Sidebar Space - Only when sidebar is visible */}
        {sidebarVisible && !isMobile && (
          <div className="w-[366px] bg-transparent flex-shrink-0">&nbsp;</div>
        )}

        {/* Show Sidebar Button - Only when sidebar is hidden */}
        {!sidebarVisible && (
          <button
            className="flex items-center px-2 md:px-4 bg-white rounded-tr-[8px] rounded-br-[8px] cursor-pointer flex-shrink-0"
            style={{ boxShadow: "4px 4px 4px 0 rgba(0, 0, 0, 0.15)" }}
            onClick={onToggleSidebar}
          >
            <div
              className="size-6 md:size-8 grid place-items-center text-[#92C36F]"
              aria-label="Show sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
          </button>
        )}

        {/* Chapter Segments */}
        <div className={`flex-1 flex ${isMobile ? "" : "min-w-max"}`}>
          {structure.sections.map((section, index) => {
            const color = getSectionColor(section.number);
            const isActive = section.number === currentSectionNumber;
            const firstChapterSlug = section.chapters[0]?.slug;
            const isLast = index === structure.sections.length - 1;

            return (
              <Link
                key={section.number}
                href={`/chapter/${firstChapterSlug}#content`}
                scroll={false}
                className={`flex items-center transition-all duration-300 hover:brightness-95 cursor-pointer ${
                  isMobile
                    ? "flex-1" // Mobile: todos usan flex-1 para distribuir uniformemente
                    : isActive
                    ? "md:flex-1 flex-shrink-0"
                    : "flex-shrink-0"
                } ${
                  isLast && isMobile ? "rounded-tr-[8px] rounded-br-[8px]" : ""
                }`}
                style={{
                  backgroundColor: color.bg,
                  // Desktop: mantiene comportamiento original con minWidth
                  minWidth: !isMobile
                    ? isActive
                      ? "420px"
                      : "50px"
                    : undefined,
                  width: !isMobile && isActive ? "auto" : undefined,
                }}
              >
                <div
                  className={`flex items-center ${
                    isActive
                      ? "px-2 md:px-6 gap-2 md:gap-4"
                      : "justify-center w-full"
                  }`}
                >
                  {/* Section Number */}
                  <span className="text-black font-medium text-sm md:text-base">
                    {section.number.toString().padStart(2, "0")}
                  </span>

                  {/* Expanded Details (only for active section) */}
                  {isActive && (
                    <>
                      {/* Section Title - hidden on mobile */}
                      <span className="hidden md:inline text-black font-medium text-base">
                        {section.title}
                      </span>

                      {/* Arrow - hidden on mobile */}
                      <ChevronRightIcon className="hidden md:inline size-6 text-black" />

                      {/* Current Chapter - abbreviated on mobile */}
                      <span className="text-black text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                        {section.chapters.find((ch) => ch.slug === currentSlug)
                          ?.title || section.chapters[0]?.title}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
