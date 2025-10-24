"use client";

import { useEffect, useRef } from "react";

interface SectionMarkerProps {
  sectionId: string;
  children: React.ReactNode;
}

export function SectionMarker({ sectionId, children }: SectionMarkerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      console.log('SectionMarker mounted:', sectionId);
    }
  }, [sectionId]);

  return (
    <div 
      ref={ref}
      data-section-id={sectionId} 
      className="section-marker"
      style={{ 
        minHeight: '100vh',
        // Removed debug borders for cleaner look
      }}
    >
      {children}
    </div>
  );
}
