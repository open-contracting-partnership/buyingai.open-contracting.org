"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import termsData from "@/app/data/terms.json";

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
  const [region, setRegionState] = useState<Region>(() => {
    // Always default to US during SSR to avoid hydration mismatch
    // For print pages, always use US
    if (typeof window !== "undefined") {
      // Check if we're on a print page - always use US for print
      const isPrintPage = window.location.pathname.includes("/print");
      if (isPrintPage) {
        return "US";
      }
      
      const savedRegion = localStorage.getItem("region") as Region | null;
      if (savedRegion === "US" || savedRegion === "GLOBAL") {
        return savedRegion;
      }
      return "US";
    }
    // During SSR, always return US to match client initial state for print pages
    return "US";
  });
  
  // Update region on mount if not a print page and different from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/print")) {
      const savedRegion = localStorage.getItem("region") as Region | null;
      if (savedRegion === "US" || savedRegion === "GLOBAL") {
        if (savedRegion !== region) {
          setRegionState(savedRegion);
        }
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
      {autoProcess ? (
        <AutoRegionWrapper>{children}</AutoRegionWrapper>
      ) : (
        children
      )}
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

    const processTextNodes = (node: Node) => {
      // Process text nodes
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent;
        const parent = node.parentElement;

        // Skip special elements
        if (
          parent?.classList.contains("no-region-replace") ||
          parent?.classList.contains("glossary-term") ||
          parent?.tagName === "SCRIPT" ||
          parent?.tagName === "STYLE" ||
          parent?.tagName === "CODE" ||
          parent?.tagName === "PRE" ||
          parent?.tagName === "INPUT" ||
          parent?.tagName === "TEXTAREA"
        ) {
          return;
        }

        // Build replacement map: both directions (US -> GLOBAL and GLOBAL -> US)
        const replacements: Array<{
          index: number;
          original: string;
          replacement: string;
          length: number;
        }> = [];

        // Sort terms by length (longest first) to handle compound terms
        const sortedTerms = [...terms].sort(
          (a, b) =>
            Math.max(b.US.length, b.GLOBAL.length) -
            Math.max(a.US.length, a.GLOBAL.length)
        );

        sortedTerms.forEach((termMapping) => {
          // If region is US, we want to replace GLOBAL terms with US terms
          // If region is GLOBAL, we want to replace US terms with GLOBAL terms
          const sourceTerm =
            region === "US" ? termMapping.GLOBAL : termMapping.US;
          const targetTerm =
            region === "US" ? termMapping.US : termMapping.GLOBAL;

          // Escape special regex characters
          const escapedSource = escapeRegex(sourceTerm);
          // Use word boundaries for whole word matching, but handle special cases
          const pattern = `\\b${escapedSource}\\b`;
          const regex = new RegExp(pattern, "gi");
          let match;

          regex.lastIndex = 0;
          while ((match = regex.exec(text)) !== null) {
            const overlaps = replacements.some(
              (m) =>
                (match!.index >= m.index &&
                  match!.index < m.index + m.length) ||
                (match!.index + match![0].length > m.index &&
                  match!.index + match![0].length <= m.index + m.length)
            );

            if (!overlaps) {
              replacements.push({
                index: match.index,
                original: match[0],
                replacement: targetTerm,
                length: match[0].length,
              });
            }

            // Prevent infinite loops
            if (match[0].length === 0) {
              regex.lastIndex++;
            }
          }
        });

        if (replacements.length > 0 && parent) {
          // Sort by index
          replacements.sort((a, b) => a.index - b.index);

          // Build the new text with replacements
          let newText = "";
          let lastIndex = 0;

          replacements.forEach((replacement) => {
            // Text before the match
            if (replacement.index > lastIndex) {
              newText += text.substring(lastIndex, replacement.index);
            }

            // Add replacement text
            newText += replacement.replacement;

            lastIndex = replacement.index + replacement.length;
          });

          // Remaining text
          if (lastIndex < text.length) {
            newText += text.substring(lastIndex);
          }

          // Replace the text node content
          node.textContent = newText;
        }
      }
      // Process element nodes
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // Skip special elements
        if (
          element.classList.contains("no-region-replace") ||
          element.classList.contains("glossary-term") ||
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE" ||
          element.tagName === "CODE" ||
          element.tagName === "PRE" ||
          element.tagName === "INPUT" ||
          element.tagName === "TEXTAREA"
        ) {
          return;
        }

        // Process children
        Array.from(node.childNodes).forEach((child) => {
          processTextNodes(child);
        });
      }
    };

    // Helper function to escape regex special characters
    function escapeRegex(str: string): string {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

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
