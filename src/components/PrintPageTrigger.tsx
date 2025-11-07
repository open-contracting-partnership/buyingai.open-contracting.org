"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function PrintPageTrigger() {
  const searchParams = useSearchParams();
  const shouldDownload = searchParams?.get("download") === "true";

  useEffect(() => {
    if (shouldDownload && typeof window !== "undefined") {
      // Wait for content to fully render
      const timer = setTimeout(() => {
        window.print();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldDownload]);

  return null;
}

