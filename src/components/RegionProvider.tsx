"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import termsData from "@/app/data/terms.json";
import { findTerms, forEachTextNode } from "@/lib/text-terms";

type Region = "US" | "GLOBAL";

// Each region's terms, replacing the other region's. The terms are written as in the middle of a sentence.
const REGION_TERMS: Record<Region, { term: string; value: string }[]> = {
  US: termsData.map((mapping) => ({ term: mapping.GLOBAL, value: mapping.US })),
  GLOBAL: termsData.map((mapping) => ({ term: mapping.US, value: mapping.GLOBAL })),
};

// The class that hides the pre-rendered content until the saved region's terms replace its US terms.
const PENDING_CLASS = "region-pending";

// Add the class before the content is first painted.
const PENDING_SCRIPT = `try{localStorage.getItem("region")==="GLOBAL"&&document.documentElement.classList.add("${PENDING_CLASS}")}catch(e){}`;

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  // Start with the region of the pre-rendered HTML, to hydrate without a mismatch.
  const [region, setRegionState] = useState<Region>("US");

  // Restore the saved region after hydration, before painting.
  useLayoutEffect(() => {
    const savedRegion = localStorage.getItem("region");
    if (savedRegion === "US" || savedRegion === "GLOBAL") {
      setRegionState(savedRegion);
    }
  }, []);

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    localStorage.setItem("region", newRegion);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: The script is a constant. */}
      <script dangerouslySetInnerHTML={{ __html: PENDING_SCRIPT }} />
      <AutoRegionWrapper>{children}</AutoRegionWrapper>
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return context;
}

// The replacement, capitalized if the replaced text is capitalized where the term isn't, or starts a sentence.
function matchCase(replacement: string, replaced: string, term: string, before: string): string {
  const capitalized = /^\p{Lu}/u.test(replaced) && (/^\p{Ll}/u.test(term) || /(^\s*|[.!?]\s+)$/.test(before));
  return capitalized ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
}

// Replace the other region's terms in the content, when the region or page changes.
function AutoRegionWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { region } = useRegion();
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: The content changes with the pathname.
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const terms = REGION_TERMS[region].map(({ term, value }) => ({ term, value: { term, value } }));
    forEachTextNode(containerRef.current, ["no-region-replace", "glossary-term"], (node) => {
      const text = node.textContent ?? "";
      const matches = findTerms(text, terms);
      if (matches.length === 0) {
        return;
      }
      let newText = "";
      let lastIndex = 0;
      for (const { index, length, value } of matches) {
        const replaced = text.substring(index, index + length);
        newText +=
          text.substring(lastIndex, index) +
          matchCase(value.value, replaced, value.term, newText + text.substring(lastIndex, index));
        lastIndex = index + length;
      }
      node.textContent = newText + text.substring(lastIndex);
    });
    if (region === "GLOBAL") {
      document.documentElement.classList.remove(PENDING_CLASS);
    }
  }, [region, pathname]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {children}
    </div>
  );
}
