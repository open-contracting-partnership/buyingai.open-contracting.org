"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/logo.svg";
import { MenuIcon, XIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import * as Popover from "@radix-ui/react-popover";
import twitterIcon from "@/app/assets/images/twitter-icon.svg";
import linkedinIcon from "@/app/assets/images/linkedin-icon.svg";
import facebookIcon from "@/app/assets/images/facebook-icon.svg";

interface Chapter {
  slug: string;
  title: string;
  order: number;
  filename: string;
}

interface HeaderProps {
  chapters: Chapter[];
}

export default function Header({ chapters }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery("");
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Filter chapters based on search query - advanced search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const queryWords = query.split(/\s+/).filter(Boolean);

      const filtered = chapters.filter((chapter) => {
        const titleLower = chapter.title.toLowerCase();

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
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        // Exact match gets highest priority
        if (aTitle === query) return -1;
        if (bTitle === query) return 1;

        // Earlier matches get priority
        const aIndex = aTitle.indexOf(query);
        const bIndex = bTitle.indexOf(query);

        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        return a.title.localeCompare(b.title);
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
        // Check if we're on mobile (screen width < 768px)
        const isMobileView = window.innerWidth < 768;

        if (isMobileView && mobileSearchInputRef.current) {
          mobileSearchInputRef.current.focus();
        } else if (!isMobileView && desktopSearchInputRef.current) {
          desktopSearchInputRef.current.focus();
        }
      }, 150);
    }
  }, [isSearchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen]);

  return (
    <header className="py-7 border-b border-white/10 sticky overflow-hidden top-0 z-[999] bg-[#3D393D]">
      <div className="w-11/12 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            <Link href="/">
              <Image
                className="h-[61px]"
                src={logo}
                alt="OCP Logo"
                width={183.19}
                height={61}
              />
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  className="shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-gray-600 placeholder:text-gray-400 w-full"
                />
                <button
                  onClick={closeSearch}
                  className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                >
                  <XIcon className="size-4 text-gray-600" />
                </button>
              </div>

              {isSearchOpen && (
                <>
                  {/* Search results popup - floating dropdown */}
                  {searchQuery && filteredChapters.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-[400px] overflow-y-auto">
                        {filteredChapters.map((chapter) => (
                          <Link
                            key={chapter.slug}
                            href={`/chapter/${chapter.slug}#content`}
                            onClick={closeSearch}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {chapter.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Chapter{" "}
                              {chapter.order.toString().padStart(2, "0")}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchQuery && filteredChapters.length === 0 && (
                    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-sm text-gray-500">
                        No chapters found
                      </div>
                    </div>
                  )}
                </>
              )}

              {!isSearchOpen && (
                <button
                  onClick={toggleSearch}
                  className="p-2 hover:bg-white/10 rounded transition-all text-white"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              )}
            </div>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="p-2 hover:bg-white/10 rounded text-white">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="rounded-lg bg-[#3D393D] p-4 shadow-2xl z-[999] animate-in fade-in slide-in-from-top-2 duration-200 border border-white/10"
                  sideOffset={8}
                >
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide font-gteesti-display">
                      Share
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url =
                            typeof window !== "undefined"
                              ? window.location.href
                              : "";
                          const text =
                            typeof document !== "undefined"
                              ? document.title
                              : "";
                          const share = new URL(
                            "https://twitter.com/intent/tweet"
                          );
                          share.searchParams.set("url", url);
                          if (text) share.searchParams.set("text", text);
                          window.open(
                            share.toString(),
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                        aria-label="Share on Twitter"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Image
                          src={twitterIcon}
                          alt="Twitter"
                          width={24}
                          height={24}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url =
                            typeof window !== "undefined"
                              ? window.location.href
                              : "";
                          const share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                            url
                          )}`;
                          window.open(share, "_blank", "noopener,noreferrer");
                        }}
                        aria-label="Share on LinkedIn"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Image
                          src={linkedinIcon}
                          alt="LinkedIn"
                          width={24}
                          height={24}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url =
                            typeof window !== "undefined"
                              ? window.location.href
                              : "";
                          const share = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            url
                          )}`;
                          window.open(share, "_blank", "noopener,noreferrer");
                        }}
                        aria-label="Share on Facebook"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Image
                          src={facebookIcon}
                          alt="Facebook"
                          width={24}
                          height={24}
                        />
                      </button>
                    </div>
                  </div>
                  <Popover.Arrow className="fill-[#3D393D]" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            {/* <Link
              href="/chapter/01-introduction#content"
              className="px-6 py-2.5 bg-[#C8D419] text-black font-semibold rounded hover:bg-[#B5C115] transition-colors font-ibm-plex-sans"
            >
              Get the playbook
            </Link> */}
          </div>

          {/* mobile */}
          <div
            className={clsx(
              "md:hidden fixed top-0 size-full h-screen duration-300 z-50",
              {
                "-left-full": !isMenuOpen,
                "left-0": isMenuOpen,
              }
            )}
          >
            <div className="size-full bg-[#3D393D] backdrop-blur-sm relative p-8">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded cursor-pointer"
                onClick={toggleMenu}
              >
                <XIcon className="size-6 text-white" />
              </button>

              {/* Content */}
              <div className="flex flex-col gap-8 mt-16">
                {/* Logo section */}
                <div className="flex items-center gap-4">
                  <Image src={logo} alt="OCP Logo" width={120} height={40} />
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#C8D419] to-[#23B2A7] bg-clip-text text-transparent font-gteesti-display">
                      Buying AI
                    </h2>
                    <p className="text-sm text-white/60 font-gteesti-pro-display">
                      Tips and tools
                    </p>
                  </div>
                </div>

                {/* Search button */}
                <button
                  onClick={toggleSearch}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white text-left w-full"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="text-white">Search</span>
                </button>

                {/* Share current page */}
                <div className="flex flex-col gap-2">
                  <h3 className="px-4 text-xs font-semibold text-white/60 uppercase tracking-wide font-gteesti-display">
                    Share
                  </h3>
                  <div className="px-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url =
                          typeof window !== "undefined"
                            ? window.location.href
                            : "";
                        const text =
                          typeof document !== "undefined" ? document.title : "";
                        const share = new URL(
                          "https://twitter.com/intent/tweet"
                        );
                        share.searchParams.set("url", url);
                        if (text) share.searchParams.set("text", text);
                        window.open(
                          share.toString(),
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      aria-label="Share on Twitter"
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Image
                        src={twitterIcon}
                        alt="Twitter"
                        width={20}
                        height={20}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url =
                          typeof window !== "undefined"
                            ? window.location.href
                            : "";
                        const share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                          url
                        )}`;
                        window.open(share, "_blank", "noopener,noreferrer");
                      }}
                      aria-label="Share on LinkedIn"
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Image
                        src={linkedinIcon}
                        alt="LinkedIn"
                        width={20}
                        height={20}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url =
                          typeof window !== "undefined"
                            ? window.location.href
                            : "";
                        const share = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          url
                        )}`;
                        window.open(share, "_blank", "noopener,noreferrer");
                      }}
                      aria-label="Share on Facebook"
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Image
                        src={facebookIcon}
                        alt="Facebook"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                </div>

                {/* CTA button */}
                {/* <Link
                  href="/chapter/01-introduction#content"
                  onClick={toggleMenu}
                  className="mt-4 px-6 py-3 bg-[#C8D419] text-black font-semibold rounded-lg hover:bg-[#B5C115] transition-colors text-center"
                >
                  Get the playbook
                </Link> */}
              </div>
            </div>
          </div>

          {/* hamburger menu */}
          <div className="md:hidden">
            <button
              className="p-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={toggleMenu}
            >
              <MenuIcon className="size-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeSearch} />
          <div className="absolute top-0 left-0 right-0 bg-white p-6 shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-0 bg-white rounded-lg border border-gray-300 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-gray-600 placeholder:text-gray-400 flex-1"
                />
                <button
                  onClick={closeSearch}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <XIcon className="size-5 text-gray-600" />
                </button>
              </div>

              {/* Mobile search results */}
              {searchQuery && filteredChapters.length > 0 && (
                <div className="max-h-[400px] overflow-y-auto border-t border-gray-200">
                  {filteredChapters.map((chapter) => (
                    <Link
                      key={chapter.slug}
                      href={`/chapter/${chapter.slug}#content`}
                      onClick={() => {
                        closeSearch();
                        setIsMenuOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {chapter.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Chapter {chapter.order.toString().padStart(2, "0")}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery && filteredChapters.length === 0 && (
                <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
                  No chapters found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
