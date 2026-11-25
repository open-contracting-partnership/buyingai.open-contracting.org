"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import termsData from "@/app/data/terms.json";
import { findTerms, forEachTextNode } from "@/lib/text-terms";

type Region = "US" | "GLOBAL";

interface TermMapping {
  US: string;
  GLOBAL: string;
}

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  terms: TermMapping[];
  getTermForRegion: (usTerm: string) => string;
  getTermForRegionReverse: (globalTerm: string) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({
  children,
  autoProcess = true,
}: {
  children: React.ReactNode;
  autoProcess?: boolean;
}) {
  // Start with the region of the pre-rendered HTML, to hydrate without a mismatch.
  const [region, setRegionState] = useState<Region>("US");

  // Restore the saved region after hydration, except on print pages
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/print")) {
      const savedRegion = localStorage.getItem("region") as Region | null;
      if (savedRegion === "US" || savedRegion === "GLOBAL") {
        setRegionState(savedRegion);
      }
    }
  }, []);

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    if (typeof window !== "undefined") {
      localStorage.setItem("region", newRegion);
    }
  };

  const terms = termsData as TermMapping[];

  // Get the term for current region from US term
  const getTermForRegion = (usTerm: string): string => {
    const termMapping = terms.find((t) => t.US === usTerm);
    if (!termMapping) return usTerm;
    return region === "US" ? termMapping.US : termMapping.GLOBAL;
  };

  // Get the term for current region from GLOBAL term (reverse lookup)
  const getTermForRegionReverse = (globalTerm: string): string => {
    const termMapping = terms.find((t) => t.GLOBAL === globalTerm);
    if (!termMapping) return globalTerm;
    return region === "US" ? termMapping.US : termMapping.GLOBAL;
  };

  return (
    <RegionContext.Provider
      value={{
        region,
        setRegion,
        terms,
        getTermForRegion,
        getTermForRegionReverse,
      }}
    >
      {autoProcess ? <AutoRegionWrapper>{children}</AutoRegionWrapper> : children}
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

// Component that processes all content and replaces terms based on region
function AutoRegionWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { region, terms } = useRegion();
  const pathname = usePathname();
  const lastRegionRef = useRef<Region>(region);
  const lastPathnameRef = useRef<string>(pathname);
  const processingKeyRef = useRef<string>("");

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a unique key for this processing cycle
    const regionChanged = lastRegionRef.current !== region;
    const pathnameChanged = lastPathnameRef.current !== pathname;

    if (regionChanged || pathnameChanged) {
      lastRegionRef.current = region;
      lastPathnameRef.current = pathname;
      // Create a new processing key to force reprocessing
      processingKeyRef.current = `${pathname}-${region}-${Date.now()}`;
    }

    // Always process when pathname or region changes, or on initial mount
    const shouldProcess = regionChanged || pathnameChanged || !processingKeyRef.current;

    if (!shouldProcess) {
      return;
    }

    // Replace the other region's terms with this region's.
    const regionTerms = terms.map((mapping) =>
      region === "US" ? { term: mapping.GLOBAL, value: mapping.US } : { term: mapping.US, value: mapping.GLOBAL },
    );

    const processTextNodes = (root: Node) => {
      forEachTextNode(root, ["no-region-replace", "glossary-term"], (node) => {
        const text = node.textContent ?? "";
        const matches = findTerms(text, regionTerms);
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
    };

    // Process the content with a delay to ensure React hydration is complete
    // Use requestIdleCallback if available, otherwise use setTimeout with longer delay
    const processContent = () => {
      if (containerRef.current) {
        processTextNodes(containerRef.current);
      }
    };

    // Wait for React hydration to complete before processing
    const timeoutId = setTimeout(() => {
      // Use requestIdleCallback for better performance, fallback to immediate execution
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(processContent, { timeout: 1000 });
      } else {
        processContent();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [region, terms, pathname]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {children}
    </div>
  );
}
