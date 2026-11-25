import { useSyncExternalStore } from "react";

// Tailwind's md breakpoint.
const QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

// Whether the viewport is narrower than Tailwind's md breakpoint. It is false when prerendering and hydrating.
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
