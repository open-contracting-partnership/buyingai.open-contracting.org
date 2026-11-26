import { type DependencyList, useEffect } from "react";

// Call the callback when the browser is idle, after hydration, and again when the dependencies change.
export function useAfterHydration(callback: () => void, deps: DependencyList) {
  useEffect(() => {
    let idleCallbackId: number | undefined;
    const timeoutId = setTimeout(() => {
      idleCallbackId = requestIdleCallback(callback, { timeout: 1000 });
    }, 300);
    return () => {
      clearTimeout(timeoutId);
      if (idleCallbackId !== undefined) {
        cancelIdleCallback(idleCallbackId);
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: The caller lists the callback's dependencies.
  }, deps);
}
