"use client";

import { ReactNode, useEffect } from "react";
import { logger } from "@/lib/logger";

interface ContentWithObserverProps {
  children: ReactNode;
  sectionId: string;
}

export function ContentWithObserver({ children, sectionId }: ContentWithObserverProps) {
  useEffect(() => {
    logger.debug('ContentWithObserver mounted with sectionId:', sectionId);
  }, [sectionId]);

  return (
    <div 
      data-section-id={sectionId} 
      className="min-h-screen"
      style={{ 
        border: '2px solid red', // Debug border
        margin: '10px 0'
      }}
    >
      {children}
    </div>
  );
}
