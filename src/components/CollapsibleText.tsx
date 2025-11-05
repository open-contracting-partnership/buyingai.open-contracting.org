"use client";

import React, { useState } from "react";

export function CollapsibleText({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="my-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 font-bold text-gray-900 hover:text-gray-700 transition-colors w-full text-left cursor-pointer"
      >
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
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
      {isOpen && (
        <div className="mt-2 ml-6 prose prose-sm max-w-none">
          {children}
        </div>
      )}
    </div>
  );
}

