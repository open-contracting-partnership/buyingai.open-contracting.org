"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";
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
  tooltip: TooltipState | null;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

export function GlossaryProvider({
  children,
  glossaryData,
  autoProcess = false, // Nueva prop para activar procesamiento automático
}: {
  children: React.ReactNode;
  glossaryData: GlossaryTerm[];
  autoProcess?: boolean;
}) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = (term: string, definition: string, x: number, y: number) => {
    setTooltip({ term, definition, position: { x, y } });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <GlossaryContext.Provider value={{ terms: glossaryData, showTooltip, hideTooltip, tooltip }}>
      {autoProcess ? <AutoGlossaryWrapper>{children}</AutoGlossaryWrapper> : children}
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
      className="fixed z-50 max-w-sm bg-gray-900 text-white rounded-lg shadow-xl p-4 pointer-events-none animate-fadeIn"
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

// Nuevo componente que procesa automáticamente todo el contenido
function AutoGlossaryWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { terms, showTooltip, hideTooltip } = useGlossary();
  const processedNodesRef = useRef<WeakSet<Node>>(new WeakSet());
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const glossaryTerms = terms.map((term) => ({ term: term.Term, value: term }));

    const processTextNodes = (root: Node) => {
      forEachTextNode(root, ["glossary-term", "no-glossary"], (node) => {
        const text = node.textContent ?? "";
        const parent = node.parentElement;
        if (processedNodesRef.current.has(node) || !parent) {
          return;
        }

        const matches = findTerms(text, glossaryTerms);
        if (matches.length === 0) {
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

        const insertedNodes = Array.from(fragment.childNodes);
        try {
          parent.replaceChild(fragment, node);
          // Don't process the new text nodes again.
          for (const insertedNode of insertedNodes) {
            processedNodesRef.current.add(insertedNode);
          }
        } catch (error) {
          // The node was already removed.
          logger.warn("GlossaryProvider: Failed to replace node", error);
        }
      });
    };

    // Process content after React hydration is complete
    const processContent = () => {
      if (!containerRef.current) {
        // Try again if container not ready
        setTimeout(processContent, 100);
        return;
      }

      // Check if there's actual text content to process
      const hasTextContent = containerRef.current.textContent && containerRef.current.textContent.trim().length > 0;

      if (!hasTextContent) {
        // If no content yet, try again after a short delay
        setTimeout(processContent, 100);
        return;
      }

      // Prevent multiple simultaneous processing
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Reset processed nodes for new content
      processedNodesRef.current = new WeakSet();

      // Process the container and also look for main element inside
      processTextNodes(containerRef.current);

      // Also process content inside main element if it exists
      const mainElement = containerRef.current.querySelector("main");
      if (mainElement) {
        processTextNodes(mainElement);
      }

      // Also process content inside article elements (common in chapter pages)
      const articleElements = containerRef.current.querySelectorAll("article");
      articleElements.forEach((article) => {
        processTextNodes(article);
      });

      isProcessingRef.current = false;
    };

    // Wait for React hydration to complete before processing
    // Use multiple attempts to ensure content is ready
    const timeoutId1 = setTimeout(() => {
      processContent();
    }, 300);

    const timeoutId2 = setTimeout(() => {
      processContent();
    }, 600);

    const timeoutId3 = setTimeout(() => {
      processContent();
    }, 1000);

    // Also use requestIdleCallback if available
    let idleCallbackId: number | null = null;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleCallbackId = requestIdleCallback(
        () => {
          processContent();
        },
        { timeout: 1500 },
      ) as unknown as number;
    }

    // Use MutationObserver to detect when content is added dynamically
    // Set it up after initial processing attempts
    let observer: MutationObserver | null = null;
    const setupObserver = () => {
      if (typeof window !== "undefined" && "MutationObserver" in window && containerRef.current && !observer) {
        observer = new MutationObserver((mutations) => {
          // Only process if new nodes were added
          const hasNewNodes = mutations.some(
            (mutation) =>
              mutation.addedNodes.length > 0 &&
              Array.from(mutation.addedNodes).some(
                (node) =>
                  node.nodeType === Node.TEXT_NODE ||
                  (node.nodeType === Node.ELEMENT_NODE && (node as Element).textContent?.trim().length > 0),
              ),
          );

          if (hasNewNodes && !isProcessingRef.current) {
            // Debounce processing
            setTimeout(() => {
              if (!isProcessingRef.current) {
                processContent();
              }
            }, 200);
          }
        });

        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    };

    // Setup observer after a delay to ensure container is ready
    const observerTimeout = setTimeout(setupObserver, 500);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(observerTimeout);
      if (idleCallbackId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        cancelIdleCallback(idleCallbackId);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [terms, showTooltip, hideTooltip, children]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      {children}
    </div>
  );
}
