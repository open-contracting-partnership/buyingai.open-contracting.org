"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAfterHydration } from "@/hooks/useAfterHydration";
import { findTerms, forEachTextNode } from "@/lib/text-terms";

interface GlossaryTerm {
  Term: string;
  Definition: string;
}

interface TooltipState {
  term: string;
  definition: string;
  position: { x: number; y: number };
}

interface GlossaryContextType {
  terms: GlossaryTerm[];
  showTooltip: (term: string, definition: string, x: number, y: number) => void;
  hideTooltip: () => void;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

export function GlossaryProvider({
  children,
  glossaryData,
}: {
  children: React.ReactNode;
  glossaryData: GlossaryTerm[];
}) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = (term: string, definition: string, x: number, y: number) => {
    setTooltip({ term, definition, position: { x, y } });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <GlossaryContext.Provider value={{ terms: glossaryData, showTooltip, hideTooltip }}>
      <AutoGlossaryWrapper>{children}</AutoGlossaryWrapper>
      {tooltip && <Tooltip {...tooltip} />}
    </GlossaryContext.Provider>
  );
}

function useGlossary() {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error("useGlossary must be used within GlossaryProvider");
  }
  return context;
}

// Componente del Tooltip
function Tooltip({ definition, position }: TooltipState) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      if (x + rect.width > viewportWidth - 20) {
        x = viewportWidth - rect.width - 20;
      }

      if (x < 20) {
        x = 20;
      }

      if (y + rect.height > viewportHeight - 20) {
        y = position.y - rect.height - 10;
      }

      setAdjustedPosition({ x, y });
    }
  }, [position]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 max-w-sm bg-gray-900 text-white rounded-lg shadow-xl p-4 pointer-events-none"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <div className="text-sm leading-relaxed text-white font-bold">{definition}</div>
      <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
    </div>
  );
}

// Highlight the glossary's terms in the content, including content that is added later.
function AutoGlossaryWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { terms, showTooltip, hideTooltip } = useGlossary();

  const highlight = () => {
    if (!containerRef.current) {
      return;
    }
    const glossaryTerms = terms.map((term) => ({ term: term.Term, value: term }));
    forEachTextNode(containerRef.current, ["glossary-term", "no-glossary"], (node) => {
      const text = node.textContent ?? "";
      const matches = findTerms(text, glossaryTerms);
      if (matches.length === 0 || !node.parentElement) {
        return;
      }

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      for (const match of matches) {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }
        const span = document.createElement("span");
        span.className = "glossary-term cursor-help bg-[#d6e100] text-black rounded-full px-1 py-0.5";
        span.textContent = text.substring(match.index, match.index + match.length);
        span.addEventListener("mouseenter", () => {
          const rect = span.getBoundingClientRect();
          showTooltip(match.value.Term, match.value.Definition, rect.left, rect.bottom + 5);
        });
        span.addEventListener("mouseleave", hideTooltip);
        fragment.appendChild(span);
        lastIndex = match.index + match.length;
      }
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }
      node.parentElement.replaceChild(fragment, node);
    });
  };

  useAfterHydration(highlight, [terms, children]);

  // Highlight content that is added later, like on client-side navigation.
  // biome-ignore lint/correctness/useExhaustiveDependencies: highlight changes only with the terms.
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(highlight, 200);
      }
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [terms]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {children}
    </div>
  );
}
