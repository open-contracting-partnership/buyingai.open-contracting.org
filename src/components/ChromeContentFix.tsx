"use client";

import { useEffect } from "react";

/**
 * Component to fix Chrome rendering issues where content might not display
 * properly after hydration. This forces a re-render check after the component
 * mounts to ensure all content is visible.
 */
export function ChromeContentFix() {
  useEffect(() => {
    // Force Chrome to recalculate layout and ensure content is visible
    const fixContentVisibility = () => {
      const contentElements = document.querySelectorAll(
        ".print-view-container, .print-content-wrapper, .print-content, .prose"
      );

      contentElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // Force reflow to ensure Chrome renders the content
        void htmlElement.offsetHeight;
        
        // Ensure visibility styles are applied
        htmlElement.style.display = "block";
        htmlElement.style.visibility = "visible";
        htmlElement.style.opacity = "1";
      });
    };

    // Run immediately
    fixContentVisibility();

    // Run after a short delay to catch any delayed rendering
    const timeoutId = setTimeout(fixContentVisibility, 100);

    // Run after React hydration completes
    const rafId = requestAnimationFrame(() => {
      fixContentVisibility();
      // Run again after another frame
      requestAnimationFrame(fixContentVisibility);
    });

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

