"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import termsData from "@/app/data/terms.json";
import { useAfterHydration } from "@/hooks/useAfterHydration";
import { findTerms, forEachTextNode } from "@/lib/text-terms";

type Region = "US" | "GLOBAL";

// Each region's terms, replacing the other region's.
const REGION_TERMS: Record<Region, { term: string; value: string }[]> = {
  US: termsData.map((mapping) => ({ term: mapping.GLOBAL, value: mapping.US })),
  GLOBAL: termsData.map((mapping) => ({ term: mapping.US, value: mapping.GLOBAL })),
};

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  // Start with the region of the pre-rendered HTML, to hydrate without a mismatch.
  const [region, setRegionState] = useState<Region>("US");

  // Restore the saved region after hydration.
  useEffect(() => {
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

// Replace the other region's terms in the content, when the region or page changes.
function AutoRegionWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { region } = useRegion();
  const pathname = usePathname();

  useAfterHydration(() => {
    if (!containerRef.current) {
      return;
    }
    forEachTextNode(containerRef.current, ["no-region-replace", "glossary-term"], (node) => {
      const text = node.textContent ?? "";
      const matches = findTerms(text, REGION_TERMS[region]);
      if (matches.length === 0) {
        return;
      }
      let newText = "";
      let lastIndex = 0;
      for (const match of matches) {
        newText += text.substring(lastIndex, match.index) + match.value;
        lastIndex = match.index + match.length;
      }
      node.textContent = newText + text.substring(lastIndex);
    });
  }, [region, pathname]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {children}
    </div>
  );
}
