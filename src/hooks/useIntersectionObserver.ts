import { useEffect, useState } from "react";

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  currentSlug?: string; // Add currentSlug to trigger re-observation
}

export function useIntersectionObserver({
  threshold = 0.01, // Lower threshold to be more sensitive
  rootMargin = "0px 0px -50% 0px", // More permissive rootMargin
  root = null,
  currentSlug,
}: UseIntersectionObserverProps = {}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observerOptions = {
      root,
      rootMargin,
      threshold,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      console.log("Intersection Observer entries:", entries.length);

      // Find the entry with the highest intersection ratio
      let maxRatio = 0;
      let mostVisibleEntry: IntersectionObserverEntry | null = null;

      entries.forEach((entry) => {
        const target = entry.target as Element;
        console.log("Entry:", {
          target: target,
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          sectionId: target.getAttribute("data-section-id"),
        });

        // Be more permissive - accept any intersecting element or elements with ratio > 0
        if (
          (entry.isIntersecting || entry.intersectionRatio > 0) &&
          entry.intersectionRatio > maxRatio
        ) {
          maxRatio = entry.intersectionRatio;
          mostVisibleEntry = entry;
        }
      });

      if (mostVisibleEntry) {
        const target = (mostVisibleEntry as IntersectionObserverEntry).target as Element;
        const sectionId = target.getAttribute("data-section-id");
        console.log("Setting active section ID:", sectionId);
        if (sectionId) {
          setActiveId(sectionId);
        }
      } else {
        // If no intersecting elements, check if any element has any visibility
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            const target = entry.target as Element;
            const sectionId = target.getAttribute("data-section-id");
            console.warn("Fallback: Setting active section ID:", sectionId);
            if (sectionId) {
              setActiveId(sectionId);
            }
          }
        });
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Wait for DOM to be ready and then observe elements
    const observeElements = () => {
      const elements = document.querySelectorAll("[data-section-id]");
      console.log("Found elements to observe:", elements.length); // Debug log
      elements.forEach((el) => observer.observe(el));
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(observeElements, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, currentSlug]);

  return activeId;
}
