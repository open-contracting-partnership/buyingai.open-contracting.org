"use client";

import { ReactNode, useEffect } from "react";

interface ContentWithObserverProps {
  children: ReactNode;
  sectionId: string;
}

export function ContentWithObserver({ children, sectionId }: ContentWithObserverProps) {
  useEffect(() => {
    console.log('ContentWithObserver mounted with sectionId:', sectionId);
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
