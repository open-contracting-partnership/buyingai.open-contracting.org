"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SectionsStructure, getSectionColor } from "@/lib/sections-types";
import { ArrowUpRight } from "lucide-react";

interface BannerCarouselProps {
  structure: SectionsStructure;
  currentSlug?: string;
}

export function BannerCarousel({
  structure,
  currentSlug,
}: BannerCarouselProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [clickedSection, setClickedSection] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Find current section based on current slug (if provided)
  const currentSectionNumber = currentSlug
    ? structure.sections.find((section) =>
        section.chapters.some((ch) => ch.slug === currentSlug)
      )?.number || 1
    : 1;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize clicked section to current section on mobile
  useEffect(() => {
    if (isMobile && clickedSection === null) {
      setClickedSection(currentSectionNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, currentSectionNumber]);

  // Handle click for mobile
  const handleCardClick = (sectionNumber: number) => {
    if (isMobile) {
      // Toggle: if clicking the same section, close it; otherwise open the clicked one
      if (clickedSection === sectionNumber) {
        setClickedSection(null);
      } else {
        setClickedSection(sectionNumber);
      }
    }
  };

  return (
    <div
      className={`flex-1 relative h-[500px] flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide p-4`}
    >
      {structure.sections.map((section, idx) => {
        const color = getSectionColor(section.number);
        const isCurrentSection = section.number === currentSectionNumber;
        const isHovered = hoveredSection === section.number;
        const isClicked = clickedSection === section.number;

        // Mobile: use clicked state; Desktop: use hover state, fallback to current section
        const shouldExpand = isMobile
          ? isClicked
          : hoveredSection !== null
          ? isHovered
          : isCurrentSection;

        // Responsive widths: mobile 320px expanded, 100px collapsed
        const baseWidth = isMobile
          ? shouldExpand
            ? 320
            : 100
          : shouldExpand
          ? 400
          : 120;

        const firstChapterSlug = section.chapters[0]?.slug;

        // Responsive overlap: better spacing on mobile
        const overlap = isMobile
          ? shouldExpand
            ? "12px"
            : "-20px"
          : shouldExpand
          ? "-20px"
          : "-40px";

        return (
          <div
            key={section.number}
            className="h-full transition-all duration-300 overflow-visible relative"
            style={{
              width: `${baseWidth}px`,
              minWidth: `${baseWidth}px`,
              marginLeft: idx > 0 ? overlap : "0",
              zIndex: shouldExpand ? 10 : 5 - idx,
            }}
          >
            <div
              className="h-full overflow-hidden relative rounded-tl-[8px] rounded-tr-[36px] rounded-bl-[36px] rounded-br-[8px] cursor-pointer"
              style={{
                backgroundColor: color.bg,
                width: "100%",
                height: "100%",
                boxShadow: shouldExpand
                  ? "0 4px 15px 0 #000"
                  : "0 4px 10px 0 rgba(0, 0, 0, 0.50)",
              }}
              onClick={() => handleCardClick(section.number)}
              onMouseEnter={() =>
                !isMobile && setHoveredSection(section.number)
              }
              onMouseLeave={() => !isMobile && setHoveredSection(null)}
            >
              {shouldExpand ? (
                // Expanded card with chapter list
                <div
                  className={`${
                    isMobile ? "px-6 py-5" : "p-8"
                  } h-full flex flex-col justify-between`}
                >
                  <div>
                    <div
                      className={`${
                        isMobile ? "text-4xl" : "text-5xl"
                      } font-bold text-black font-gteesti-display`}
                    >
                      {section.number.toString().padStart(2, "0")}
                    </div>
                    <h3
                      className={`${
                        isMobile ? "my-2 text-lg" : "my-2 text-2xl"
                      } font-medium text-black font-gteesti-display`}
                    >
                      {section.title}
                    </h3>

                    {/* Chapter list - show fewer chapters on mobile */}
                    {section.chapters.length > 0 && (
                      <div
                        className={`border-t border-black/10 pt-2 ${
                          isMobile ? "space-y-2 mt-3" : "space-y-2"
                        }`}
                      >
                        {section.chapters
                          .slice(0, isMobile ? 4 : 6)
                          .map((ch, chIdx) => {
                            // For Introduction section (section 1), always go to first chapter
                            const linkHref =
                              section.number === 1
                                ? `/chapter/${firstChapterSlug}#content`
                                : `/chapter/${ch.slug}#content`;

                            return (
                              <Link
                                key={ch.slug}
                                href={linkHref}
                                scroll={false}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex items-center gap-2.5 border-b border-black/10 pb-2 gont ${
                                  isMobile ? "text-sm" : "text-base"
                                } text-black/80 hover:text-black transition-colors group`}
                              >
                                <span
                                  className={`${
                                    isMobile
                                      ? "font-mono text-sm"
                                      : "font-mono text-base"
                                  }`}
                                >
                                  {chIdx + 1}.
                                </span>
                                <span className="flex-1 line-clamp-2">
                                  {ch.title}
                                </span>
                                {!isMobile && (
                                  <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {!isMobile && (
                    <Link
                      href={`/chapter/${firstChapterSlug}${
                        currentSlug ? "#content" : ""
                      }`}
                      scroll={false}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-end gap-2 text-black mt-4 hover:gap-3 transition-all"
                    >
                      <span className="text-base font-medium">Read</span>
                      <div className="transform rotate-180">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="-rotate-90"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 8 16 12 12 16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                    </Link>
                  )}
                </div>
              ) : (
                // Collapsed card
                <div
                  className={`h-full flex items-start justify-center ${
                    isMobile ? "pt-5 pl-5" : "pt-8 pl-8"
                  }`}
                >
                  <span
                    className={`${
                      isMobile ? "text-3xl" : "text-3xl"
                    } font-bold text-black/50 transition-colors`}
                  >
                    {section.number.toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
