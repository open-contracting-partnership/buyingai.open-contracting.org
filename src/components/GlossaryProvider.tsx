"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

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

const GlossaryContext = createContext<GlossaryContextType | undefined>(
  undefined
);

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

  const showTooltip = (
    term: string,
    definition: string,
    x: number,
    y: number
  ) => {
    setTooltip({ term, definition, position: { x, y } });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <GlossaryContext.Provider
      value={{ terms: glossaryData, showTooltip, hideTooltip, tooltip }}
    >
      {autoProcess ? (
        <AutoGlossaryWrapper>{children}</AutoGlossaryWrapper>
      ) : (
        children
      )}
      {tooltip && <Tooltip {...tooltip} />}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error("useGlossary must be used within GlossaryProvider");
  }
  return context;
}

// Componente del Tooltip
function Tooltip({ term, definition, position }: TooltipState) {
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
    const processTextNodes = (node: Node) => {
      // Si ya procesamos este nodo, saltar
      if (processedNodesRef.current.has(node)) return;

      // Si es un nodo de texto
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent;
        const parent = node.parentElement;

        // No procesar si ya es un término del glosario o está en elementos especiales
        if (
          parent?.classList.contains("glossary-term") ||
          parent?.classList.contains("no-glossary") ||
          parent?.tagName === "SCRIPT" ||
          parent?.tagName === "STYLE" ||
          parent?.tagName === "CODE" ||
          parent?.tagName === "PRE"
        ) {
          return;
        }

        // Buscar términos en el texto
        const sortedTerms = [...terms].sort(
          (a, b) => b.Term.length - a.Term.length
        );
        let hasMatches = false;
        const matches: Array<{
          index: number;
          term: GlossaryTerm;
          length: number;
        }> = [];

        sortedTerms.forEach((term) => {
          // Escape special regex characters and create case-insensitive pattern
          // The "gi" flag makes it case-insensitive (matches "Bias", "bias", "BIAS", etc.)
          const escapedTerm = escapeRegex(term.Term);
          const pattern = `\\b${escapedTerm}\\b`;
          const regex = new RegExp(pattern, "gi");
          let match;

          // Find all matches in this text node
          // Reset lastIndex to avoid regex state issues between iterations
          regex.lastIndex = 0;
          while ((match = regex.exec(text)) !== null) {
            const overlaps = matches.some(
              (m) =>
                (match!.index >= m.index &&
                  match!.index < m.index + m.length) ||
                (match!.index + match![0].length > m.index &&
                  match!.index + match![0].length <= m.index + m.length)
            );

            if (!overlaps) {
              matches.push({
                index: match.index,
                term: term,
                length: match[0].length,
              });
              hasMatches = true;
            }
            
            // Prevent infinite loops with zero-length matches
            if (match[0].length === 0) {
              regex.lastIndex++;
            }
          }
        });

        if (hasMatches && parent) {
          matches.sort((a, b) => a.index - b.index);
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;

          matches.forEach((match) => {
            // Texto antes del match
            if (match.index > lastIndex) {
              fragment.appendChild(
                document.createTextNode(text.substring(lastIndex, match.index))
              );
            }

            // Crear elemento para el término
            const span = document.createElement("span");
            span.className =
              "glossary-term cursor-help bg-[#c8d419] rounded-full px-1 py-0.5";
            span.textContent = text.substring(
              match.index,
              match.index + match.length
            );

            span.addEventListener("mouseenter", (e) => {
              const rect = span.getBoundingClientRect();
              showTooltip(
                match.term.Term,
                match.term.Definition,
                rect.left,
                rect.bottom + 5
              );
            });

            span.addEventListener("mouseleave", () => {
              hideTooltip();
            });

            fragment.appendChild(span);
            lastIndex = match.index + match.length;
          });

          // Texto restante
          if (lastIndex < text.length) {
            fragment.appendChild(
              document.createTextNode(text.substring(lastIndex))
            );
          }

          // Mark the original node as processed before replacing
          processedNodesRef.current.add(node);
          
          // Replace the node with the fragment
          try {
            parent.replaceChild(fragment, node);
            
            // Mark all new nodes in the fragment as processed to avoid re-processing
            // Note: fragment.childNodes is empty after replaceChild, so we need to get nodes from parent
            const insertedNodes = Array.from(parent.childNodes).filter(
              (n) => !processedNodesRef.current.has(n) && n !== node
            );
            insertedNodes.forEach((newNode) => {
              processedNodesRef.current.add(newNode);
              if (newNode.nodeType === Node.ELEMENT_NODE) {
                // Also mark text nodes inside
                newNode.childNodes.forEach((child) => {
                  processedNodesRef.current.add(child);
                });
              }
            });
          } catch (error) {
            // If replaceChild fails (e.g., node was already removed), skip
            console.warn("GlossaryProvider: Failed to replace node", error);
          }
        }
      }
      // Si es un elemento, procesar sus hijos
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // No procesar elementos especiales
        if (
          element.classList.contains("no-glossary") ||
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE" ||
          element.tagName === "CODE" ||
          element.tagName === "PRE"
        ) {
          return;
        }

        // Procesar hijos
        Array.from(node.childNodes).forEach((child) => {
          processTextNodes(child);
        });
      }
    };

    // Función auxiliar para escapar caracteres especiales en regex
    function escapeRegex(str: string): string {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Process content after React hydration is complete
    const processContent = () => {
      if (!containerRef.current) {
        // Try again if container not ready
        setTimeout(processContent, 100);
        return;
      }
      
      // Check if there's actual text content to process
      const hasTextContent = containerRef.current.textContent && 
                            containerRef.current.textContent.trim().length > 0;
      
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
      const mainElement = containerRef.current.querySelector('main');
      if (mainElement) {
        processTextNodes(mainElement);
      }
      
      // Also process content inside article elements (common in chapter pages)
      const articleElements = containerRef.current.querySelectorAll('article');
      articleElements.forEach(article => {
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
      idleCallbackId = requestIdleCallback(() => {
        processContent();
      }, { timeout: 1500 }) as unknown as number;
    }

    // Use MutationObserver to detect when content is added dynamically
    // Set it up after initial processing attempts
    let observer: MutationObserver | null = null;
    const setupObserver = () => {
      if (typeof window !== "undefined" && "MutationObserver" in window && containerRef.current && !observer) {
        observer = new MutationObserver((mutations) => {
          // Only process if new nodes were added
          const hasNewNodes = mutations.some(mutation => 
            mutation.addedNodes.length > 0 && 
            Array.from(mutation.addedNodes).some(node => 
              node.nodeType === Node.TEXT_NODE || 
              (node.nodeType === Node.ELEMENT_NODE && (node as Element).textContent?.trim().length > 0)
            )
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
          characterData: true
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

// Exportar también el componente manual para casos específicos
export function GlossaryText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const { terms, showTooltip, hideTooltip } = useGlossary();

  const processedContent = React.useMemo(() => {
    let text = children;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedTerms = [...terms].sort(
      (a, b) => b.Term.length - a.Term.length
    );
    const matches: Array<{
      index: number;
      term: GlossaryTerm;
      length: number;
    }> = [];

    sortedTerms.forEach((term) => {
      const regex = new RegExp(
        `\\b${term.Term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      let match;

      while ((match = regex.exec(text)) !== null) {
        const overlaps = matches.some(
          (m) =>
            (match!.index >= m.index && match!.index < m.index + m.length) ||
            (match!.index + match![0].length > m.index &&
              match!.index + match![0].length <= m.index + m.length)
        );

        if (!overlaps) {
          matches.push({
            index: match.index,
            term: term,
            length: match[0].length,
          });
        }
      }
    });

    matches.sort((a, b) => a.index - b.index);

    matches.forEach((match, idx) => {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const matchedText = text.substring(
        match.index,
        match.index + match.length
      );
      elements.push(
        <GlossaryWord
          key={`term-${idx}`}
          term={matchedText}
          definition={match.term.Definition}
        />
      );

      lastIndex = match.index + match.length;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return elements.length > 0 ? elements : [children];
  }, [children, terms]);

  return <span className={className}>{processedContent}</span>;
}

function GlossaryWord({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  const { showTooltip, hideTooltip } = useGlossary();

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    showTooltip(term, definition, rect.left, rect.bottom + 5);
  };

  return (
    <span
      className="glossary-term cursor-help bg-[#c8d419] rounded-full px-1 py-0.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={hideTooltip}
    >
      {term}
    </span>
  );
}
