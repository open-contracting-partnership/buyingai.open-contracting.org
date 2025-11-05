"use client";

import React, { useState } from "react";

export function CollapsibleText({ 
  title, 
  heading, 
  children 
}: { 
  title: string; 
  heading?: string; 
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine heading level and corresponding classes
  const headingLevel = heading ? parseInt(heading.replace(/^#+/, '').trim() || '4') : 4;
  const HeadingTag = `h${headingLevel}` as React.ElementType;
  
  // Get appropriate text size based on heading level
  const textSizeClass = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base',
  }[headingLevel] || 'text-xl';
  
  return (
    <div className="my-6">
      <HeadingTag className="font-gteesti-display">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 font-bold text-gray-900 hover:text-gray-700 transition-colors w-full text-left cursor-pointer ${textSizeClass}`}
        >
          <svg
            className={`w-5 h-5 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>{title}</span>
        </button>
      </HeadingTag>
      {isOpen && (
        <div className="mt-4 ml-7">
          {children}
        </div>
      )}
    </div>
  );
}

