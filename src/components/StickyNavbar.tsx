"use client";

import clsx from "clsx";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import {
  formatSectionNumber,
  getChapterInSection,
  getSectionColor,
  type SectionsStructure,
} from "@/lib/sections-types";

interface StickyNavbarProps {
  structure: SectionsStructure;
  currentSlug: string;
  visible: boolean;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export function StickyNavbar({ structure, currentSlug, visible, sidebarVisible, onToggleSidebar }: StickyNavbarProps) {
  const current = getChapterInSection(structure, currentSlug);
  const currentSectionNumber = current?.section.number ?? 1;

  return (
    <nav
      aria-label="Sections"
      className={`fixed left-0 right-0 z-40 transition-opacity duration-300 bg-[#D6E100] ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        top: "117px", // Position below the main header (py-7 = 28px*2 + 61px logo = 117px)
      }}
    >
      {/* Chapter Indicator Bar */}
      <div className="h-[60px] flex overflow-x-auto overflow-y-hidden scrollbar-hide">
        {/* Sidebar Space - Only when sidebar is visible, on desktop */}
        {sidebarVisible && <div className="hidden md:block w-[366px] bg-transparent flex-shrink-0">&nbsp;</div>}

        {/* Show Sidebar Button - Only when sidebar is hidden */}
        {!sidebarVisible && (
          <button
            type="button"
            className="flex items-center px-2 md:px-4 bg-transparent cursor-pointer flex-shrink-0 border-none outline-none focus:outline-none"
            onClick={onToggleSidebar}
            aria-label="Show sidebar"
          >
            <div className="size-6 md:size-8 grid place-items-center text-black">
              <svg
                aria-hidden="true"
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
        <ul className="flex-1 flex md:min-w-max">
          {structure.sections.map((section, index) => {
            const color = getSectionColor(section.number);
            const isActive = section.number === currentSectionNumber;
            const firstChapterSlug = section.chapters[0]?.slug;
            const isLast = index === structure.sections.length - 1;

            return (
              <li
                key={section.number}
                // On mobile, the sections share the width. On desktop, the active section is wider.
                className={clsx(
                  "flex flex-1 transition-all duration-300 hover:brightness-95",
                  isActive ? "md:min-w-[420px]" : "md:flex-none md:min-w-[50px]",
                  isLast && "max-md:rounded-tr-[8px] max-md:rounded-br-[8px]",
                )}
                style={{ backgroundColor: color.bg }}
              >
                <Link
                  href={`/chapter/${firstChapterSlug}#content`}
                  scroll={false}
                  className="flex flex-1 items-center cursor-pointer"
                >
                  <div
                    className={`flex items-center ${isActive ? "px-2 md:px-6 gap-2 md:gap-4" : "justify-center w-full"}`}
                  >
                    {/* Section Number */}
                    <span className="text-black font-medium text-sm md:text-base">
                      {formatSectionNumber(section.number)}
                    </span>

                    {/* Expanded Details (only for active section) */}
                    {isActive && (
                      <>
                        {/* Section Title - hidden on mobile */}
                        <span className="hidden md:inline text-black font-medium text-base">{section.title}</span>

                        {/* Arrow - hidden on mobile */}
                        <ChevronRightIcon className="hidden md:inline size-6 text-black" />

                        {/* Current Chapter - abbreviated on mobile */}
                        <span className="text-black text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                          {current?.chapter.title ?? section.chapters[0]?.title}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
