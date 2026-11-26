"use client";

import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { GlobeIcon, MenuIcon, SearchIcon, Share2Icon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import facebookIcon from "@/app/assets/images/facebook-icon.svg";
import linkedinIcon from "@/app/assets/images/linkedin-icon.svg";
import logo from "@/app/assets/images/logo.svg";
import twitterIcon from "@/app/assets/images/twitter-icon.svg";
import { useIsMobile } from "@/hooks/useIsMobile";
import { FULL_GUIDE_PDF_URL } from "@/lib/links";
import { formatSectionNumber } from "@/lib/sections-types";
import { ChapterTitle, plainText } from "./ChapterTitle";
import { useRegion } from "./RegionProvider";

interface Chapter {
  slug: string;
  title: string;
  order: number;
  filename: string;
  sectionNumber: number;
  sectionTitle: string;
}

interface HeaderProps {
  chapters: Chapter[];
}

// US Flag SVG Component (simplified for icon use)
function USFlagIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Red background */}
      <rect width="60" height="40" fill="#B22234" />
      {/* White stripes */}
      <rect width="60" height="3.08" y="3.08" fill="#fff" />
      <rect width="60" height="3.08" y="9.23" fill="#fff" />
      <rect width="60" height="3.08" y="15.38" fill="#fff" />
      <rect width="60" height="3.08" y="21.54" fill="#fff" />
      <rect width="60" height="3.08" y="27.69" fill="#fff" />
      <rect width="60" height="3.08" y="33.85" fill="#fff" />
      {/* Blue canton */}
      <rect width="24" height="18.46" fill="#3C3B6E" />
      {/* Stars (simplified as dots) */}
      <circle cx="3" cy="3" r="1" fill="#fff" />
      <circle cx="8" cy="3" r="1" fill="#fff" />
      <circle cx="13" cy="3" r="1" fill="#fff" />
      <circle cx="18" cy="3" r="1" fill="#fff" />
      <circle cx="21" cy="3" r="1" fill="#fff" />
      <circle cx="3" cy="8" r="1" fill="#fff" />
      <circle cx="8" cy="8" r="1" fill="#fff" />
      <circle cx="13" cy="8" r="1" fill="#fff" />
      <circle cx="18" cy="8" r="1" fill="#fff" />
      <circle cx="21" cy="8" r="1" fill="#fff" />
      <circle cx="3" cy="13" r="1" fill="#fff" />
      <circle cx="8" cy="13" r="1" fill="#fff" />
      <circle cx="13" cy="13" r="1" fill="#fff" />
      <circle cx="18" cy="13" r="1" fill="#fff" />
      <circle cx="21" cy="13" r="1" fill="#fff" />
      <circle cx="3" cy="18" r="1" fill="#fff" />
      <circle cx="8" cy="18" r="1" fill="#fff" />
      <circle cx="13" cy="18" r="1" fill="#fff" />
      <circle cx="18" cy="18" r="1" fill="#fff" />
      <circle cx="21" cy="18" r="1" fill="#fff" />
    </svg>
  );
}

function openShareWindow(share: string) {
  window.open(share, "_blank", "noopener,noreferrer");
}

const SHARE_TARGETS = [
  {
    name: "Twitter",
    icon: twitterIcon,
    share: () => {
      const share = new URL("https://twitter.com/intent/tweet");
      share.searchParams.set("url", window.location.href);
      if (document.title) share.searchParams.set("text", document.title);
      openShareWindow(share.toString());
    },
  },
  {
    name: "LinkedIn",
    icon: linkedinIcon,
    share: () =>
      openShareWindow(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      ),
  },
  {
    name: "Facebook",
    icon: facebookIcon,
    share: () =>
      openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`),
  },
];

function ShareButtons({ iconSize, className }: { iconSize: number; className: string }) {
  return SHARE_TARGETS.map(({ name, icon, share }) => (
    <button key={name} type="button" onClick={share} aria-label={`Share on ${name}`} className={className}>
      <Image src={icon} alt={name} width={iconSize} height={iconSize} />
    </button>
  ));
}

const REGIONS = [
  { region: "US", label: "United States", icon: <USFlagIcon className="w-5 h-3.5 shrink-0" /> },
  { region: "GLOBAL", label: "Global", icon: <GlobeIcon className="w-5 h-5 shrink-0" /> },
] as const;

function RegionButtons({
  className,
  inactiveClassName,
  labelClassName,
  onSelect,
}: {
  className: string;
  inactiveClassName: string;
  labelClassName: string;
  onSelect?: () => void;
}) {
  const { region: currentRegion, setRegion } = useRegion();
  return REGIONS.map(({ region, label, icon }) => (
    <button
      key={region}
      type="button"
      onClick={() => {
        setRegion(region);
        onSelect?.();
      }}
      className={clsx(className, region === currentRegion ? "bg-white/20 text-white" : inactiveClassName)}
    >
      {icon}
      <span className={labelClassName}>{label}</span>
    </button>
  ));
}

function SearchResults({ chapters, onSelect }: { chapters: Chapter[]; onSelect: () => void }) {
  return chapters.map((chapter) => (
    <Link
      key={chapter.slug}
      href={`/chapter/${chapter.slug}#content`}
      onClick={onSelect}
      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="text-sm font-medium text-gray-900">
        <ChapterTitle title={chapter.title} />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {formatSectionNumber(chapter.sectionNumber)} {chapter.sectionTitle}
      </div>
    </Link>
  ));
}

export default function Header({ chapters }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const { region } = useRegion();
  const [isRegionPopoverOpen, setIsRegionPopoverOpen] = useState(false);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery("");
    }
  };

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Filter chapters based on search query - advanced search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const queryWords = query.split(/\s+/).filter(Boolean);

      const filtered = chapters.filter((chapter) => {
        const titleLower = plainText(chapter.title).toLowerCase();

        // Exact match
        if (titleLower === query) return true;

        // All words match
        if (queryWords.length > 1) {
          return queryWords.every((word) => titleLower.includes(word));
        }

        // Single word or phrase match
        return titleLower.includes(query);
      });

      // Sort by relevance: exact matches first, then by position of match
      const sorted = filtered.sort((a, b) => {
        const aTitle = plainText(a.title).toLowerCase();
        const bTitle = plainText(b.title).toLowerCase();

        // Exact match gets highest priority
        if (aTitle === query) return -1;
        if (bTitle === query) return 1;

        // Earlier matches get priority
        const aIndex = aTitle.indexOf(query);
        const bIndex = bTitle.indexOf(query);

        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        return aTitle.localeCompare(bTitle);
      });

      setFilteredChapters(sorted);
    } else {
      setFilteredChapters([]);
    }
  }, [searchQuery, chapters]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        (isMobile ? mobileSearchInputRef : desktopSearchInputRef).current?.focus();
      }, 150);
    }
  }, [isSearchOpen, isMobile]);

  // Close search on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen, closeSearch]);

  return (
    <header className="py-7 border-b border-white/10 sticky top-0 z-[9999] bg-[#3D393D]">
      <div className="w-11/12 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            <Link href="/">
              <Image className="h-[61px]" src={logo} alt="OCP Logo" width={183.19} height={61} />
            </Link>
          </div>

          {/* desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search container with animation */}
            <div className="relative flex items-center">
              <div
                className={`flex items-center gap-3 bg-white rounded-lg border border-gray-300 px-4 py-2.5 shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
                  isSearchOpen ? "w-[400px] opacity-100" : "w-0 opacity-0"
                }`}
              >
                <SearchIcon size={18} color="#9CA3AF" className="shrink-0" />
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  placeholder="Search chapters..."
                  aria-label="Search chapters"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-gray-600 placeholder:text-gray-400 w-full"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                >
                  <XIcon className="size-4 text-gray-600" />
                </button>
              </div>

              {isSearchOpen && (
                <>
                  {/* Search results popup - floating dropdown */}
                  {searchQuery && filteredChapters.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-[10000] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[400px] overflow-y-auto">
                        <SearchResults chapters={filteredChapters} onSelect={closeSearch} />
                      </div>
                    </div>
                  )}
                  {searchQuery && filteredChapters.length === 0 && (
                    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-[10000] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-sm text-gray-500">No chapters found</div>
                    </div>
                  )}
                </>
              )}

              {!isSearchOpen && (
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="p-2 hover:bg-white/10 rounded transition-all text-white"
                  aria-label="Search"
                >
                  <SearchIcon size={24} />
                </button>
              )}
            </div>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button type="button" className="p-2 hover:bg-white/10 rounded text-white" aria-label="Share">
                  <Share2Icon size={24} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="rounded-lg bg-[#3D393D] p-4 shadow-2xl z-[10000] animate-in fade-in slide-in-from-top-2 duration-200 border border-white/10"
                  sideOffset={8}
                >
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wide font-gteesti-display">
                      Share
                    </p>
                    <div className="flex items-center gap-2">
                      <ShareButtons iconSize={24} className="p-2 hover:bg-white/10 rounded-lg transition-colors" />
                    </div>
                  </div>
                  <Popover.Arrow className="fill-[#3D393D]" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Region/Language Switcher */}
            <Popover.Root open={isRegionPopoverOpen} onOpenChange={setIsRegionPopoverOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="p-2 hover:bg-white/10 rounded text-white flex items-center justify-center"
                  aria-label={`Region: ${region === "US" ? "United States" : "Global"}`}
                >
                  {region === "US" ? <USFlagIcon className="w-7 h-5" /> : <GlobeIcon className="w-6 h-6" />}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="rounded-lg bg-[#3D393D] p-4 shadow-2xl z-[10000] animate-in fade-in slide-in-from-top-2 duration-200 border border-white/10 min-w-[180px]"
                  sideOffset={8}
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wide font-gteesti-display mb-1">
                      Region
                    </p>
                    <RegionButtons
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left"
                      inactiveClassName="hover:bg-white/10 text-white/80"
                      labelClassName="text-sm"
                      onSelect={() => setIsRegionPopoverOpen(false)}
                    />
                  </div>
                  <Popover.Arrow className="fill-[#3D393D]" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            {/* The open search box leaves no room below xl. */}
            <a
              href={FULL_GUIDE_PDF_URL}
              className={clsx(
                "px-6 py-2.5 bg-[#D6E100] text-black font-semibold rounded hover:bg-[#B5C115] transition-colors font-ibm-plex-sans whitespace-nowrap",
                { "hidden xl:inline": isSearchOpen },
              )}
            >
              Download full guide (PDF)
            </a>
          </div>

          {/* mobile */}
          <div
            className={clsx("md:hidden fixed top-0 size-full h-screen duration-300 z-50", {
              "-left-full": !isMenuOpen,
              "left-0": isMenuOpen,
            })}
          >
            <div className="size-full bg-[#3D393D] backdrop-blur-sm relative p-8">
              {/* Close button */}
              <button
                type="button"
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded cursor-pointer"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <XIcon className="size-6 text-white" />
              </button>

              {/* Content */}
              <div className="flex flex-col gap-8 mt-16">
                {/* Logo section */}
                <div className="flex items-center gap-4">
                  <Image src={logo} alt="OCP Logo" width={120} height={40} />
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#D6E100] to-[#23B2A7] bg-clip-text text-transparent font-gteesti-display">
                      Buying AI
                    </p>
                    <p className="text-sm text-white/60 font-gteesti-pro-display">Tips and tools</p>
                  </div>
                </div>

                {/* Search button */}
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white text-left w-full"
                >
                  <SearchIcon size={20} />
                  <span className="text-white">Search</span>
                </button>

                {/* Region/Language Switcher */}
                <div className="flex flex-col gap-2">
                  <p className="px-4 text-xs font-semibold text-white/60 uppercase tracking-wide font-gteesti-display">
                    Region
                  </p>
                  <div className="px-2 flex flex-col gap-2">
                    <RegionButtons
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left w-full"
                      inactiveClassName="bg-white/5 hover:bg-white/10 text-white/80"
                      labelClassName="text-white"
                    />
                  </div>
                </div>

                {/* Share current page */}
                <div className="flex flex-col gap-2">
                  <p className="px-4 text-xs font-semibold text-white/60 uppercase tracking-wide font-gteesti-display">
                    Share
                  </p>
                  <div className="px-2 flex items-center gap-2">
                    <ShareButtons
                      iconSize={20}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    />
                  </div>
                </div>

                <a
                  href={FULL_GUIDE_PDF_URL}
                  onClick={toggleMenu}
                  className="mt-4 px-6 py-3 bg-[#D6E100] text-black font-semibold rounded-lg hover:bg-[#B5C115] transition-colors text-center"
                >
                  Download full guide (PDF)
                </a>
              </div>
            </div>
          </div>

          {/* hamburger menu */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={toggleMenu}
              aria-label="Open menu"
            >
              <MenuIcon className="size-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeSearch} aria-hidden="true" />
          <div className="absolute top-0 left-0 right-0 bg-white p-6 shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-0 bg-white rounded-lg border border-gray-300 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <SearchIcon size={20} color="#9CA3AF" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Search chapters..."
                  aria-label="Search chapters"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-gray-600 placeholder:text-gray-400 flex-1"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <XIcon className="size-5 text-gray-600" />
                </button>
              </div>

              {/* Mobile search results */}
              {searchQuery && filteredChapters.length > 0 && (
                <div className="max-h-[400px] overflow-y-auto border-t border-gray-200">
                  <SearchResults
                    chapters={filteredChapters}
                    onSelect={() => {
                      closeSearch();
                      setIsMenuOpen(false);
                    }}
                  />
                </div>
              )}
              {searchQuery && filteredChapters.length === 0 && (
                <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">No chapters found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
