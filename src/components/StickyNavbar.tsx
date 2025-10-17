'use client'

import Link from 'next/link'
import { SectionsStructure, getSectionColor } from '@/lib/sections-types'

interface StickyNavbarProps {
  structure: SectionsStructure
  currentSlug: string
  visible: boolean
  sidebarVisible: boolean
  onToggleSidebar: () => void
}

export function StickyNavbar({ structure, currentSlug, visible, sidebarVisible, onToggleSidebar }: StickyNavbarProps) {
  // Find current section based on current slug
  const currentSectionNumber = structure.sections.find(section =>
    section.chapters.some(ch => ch.slug === currentSlug)
  )?.number || 1

  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        top: '88px', // Position below the main header
      }}
    >
      {/* Chapter Indicator Bar */}
      <div className="h-[60px] flex">
        {/* Sidebar Section - "Table of contents" */}
        {sidebarVisible && (
          <div className="w-[366px] bg-white border-r border-gray-200 flex items-center px-8">
            <span className="text-base font-medium text-black">Table of content</span>
          </div>
        )}

        {/* Chapter Segments */}
        <div className="flex-1 flex">
        {structure.sections.map((section) => {
          const color = getSectionColor(section.number)
          const isActive = section.number === currentSectionNumber
          const firstChapterSlug = section.chapters[0]?.slug

          return (
            <Link
              key={section.number}
              href={`/chapter/${firstChapterSlug}#content`}
              scroll={false}
              className={`flex items-center transition-all duration-300 hover:brightness-95 cursor-pointer ${
                isActive ? 'flex-1' : ''
              }`}
              style={{
                backgroundColor: color.bg,
                minWidth: isActive ? '420px' : '60px',
                width: isActive ? 'auto' : '60px'
              }}
            >
              <div className={`flex items-center ${isActive ? 'px-6 gap-4' : 'justify-center w-full'}`}>
                {/* Section Number */}
                <span className="text-black font-medium text-base">
                  {section.number.toString().padStart(2, '0')}
                </span>

                {/* Expanded Details (only for active section) */}
                {isActive && (
                  <>
                    {/* Icon */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="2"/>
                        <path d="M12 8v8M8 12h8"/>
                      </svg>
                    </div>

                    {/* Section Title */}
                    <span className="text-black font-medium text-base">
                      {section.title}
                    </span>

                    {/* Arrow */}
                    <span className="text-black mx-2">→</span>

                    {/* Current Chapter */}
                    <span className="text-black text-sm">
                      {section.chapters.find(ch => ch.slug === currentSlug)?.title || section.chapters[0]?.title}
                    </span>
                  </>
                )}
              </div>
            </Link>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
