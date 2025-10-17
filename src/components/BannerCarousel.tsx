'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SectionsStructure, getSectionColor } from '@/lib/sections-types'

interface BannerCarouselProps {
  structure: SectionsStructure
  currentSlug?: string
}

export function BannerCarousel({ structure, currentSlug }: BannerCarouselProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)

  // Find current section based on current slug (if provided)
  const currentSectionNumber = currentSlug
    ? structure.sections.find(section =>
        section.chapters.some(ch => ch.slug === currentSlug)
      )?.number || 1
    : 1

  return (
    <div className="flex-1 relative h-[460px] flex items-center">
      {structure.sections.map((section, idx) => {
        const color = getSectionColor(section.number)
        const isCurrentSection = section.number === currentSectionNumber
        const isHovered = hoveredSection === section.number
        // Only expand one card at a time: hovered if hovering, otherwise current
        const shouldExpand = hoveredSection !== null ? isHovered : isCurrentSection
        const baseWidth = shouldExpand ? 400 : 120
        const firstChapterSlug = section.chapters[0]?.slug

        // Reduce overlap for expanded cards so they don't hide previous cards
        const overlap = shouldExpand ? '-20px' : '-60px'

        return (
          <div
            key={section.number}
            className={`h-full transition-all duration-300 overflow-visible relative rounded-tl-[8px] rounded-tr-[36px] rounded-bl-[36px] rounded-br-[8px] ${
              shouldExpand ? 'shadow-lg' : ''
            }`}
            style={{
              backgroundColor: color.bg,
              width: `${baseWidth}px`,
              minWidth: `${baseWidth}px`,
              marginLeft: idx > 0 ? overlap : '0',
              zIndex: shouldExpand ? 10 : 5 - idx
            }}
            onMouseEnter={() => setHoveredSection(section.number)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {shouldExpand ? (
              // Expanded card with chapter list
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-5xl font-bold text-black mb-4">
                    {section.number.toString().padStart(2, '0')}
                  </div>
                  <h3 className="text-2xl font-medium text-black mb-6">
                    {section.title}
                  </h3>

                  {/* Chapter list - show for any expanded card */}
                  {section.chapters.length > 0 && (
                    <div className="space-y-2">
                      {section.chapters.slice(0, 6).map((ch, chIdx) => (
                        <Link
                          key={ch.slug}
                          href={`/chapter/${ch.slug}#content`}
                          scroll={false}
                          className="flex items-center gap-2 text-sm text-black/80 hover:text-black transition-colors group"
                        >
                          <span className="font-mono text-xs">{String.fromCharCode(97 + chIdx)}.</span>
                          <span className="flex-1 line-clamp-1">{ch.title}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <polyline points="7 13 12 18 17 13"/>
                            <polyline points="7 6 12 11 17 6"/>
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href={`/chapter/${firstChapterSlug}${currentSlug ? '#content' : ''}`}
                  scroll={false}
                  className="flex items-center gap-2 text-black mt-4 hover:gap-3 transition-all"
                >
                  <span className="text-sm font-medium">
                    {isCurrentSection ? `Open chapter ${section.number}` : 'Begin here'}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-rotate-90">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 8 16 12 12 16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </Link>
              </div>
            ) : (
              // Collapsed card
              <div className="h-full flex items-start justify-center pt-8 pl-16">
                <span className="text-5xl font-bold text-black/50 transition-colors">
                  {section.number.toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
