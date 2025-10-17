'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Chapter } from '@/lib/markdown'
import { SectionsStructure, getChapterInSection, getSectionColor } from '@/lib/sections-types'
import { StickyNavbar } from './StickyNavbar'

interface ChapterLayoutProps {
  currentSlug: string
  allChapters: Chapter[]
  children: React.ReactNode
  chapterOrder: number
  totalChapters: number
  structure: SectionsStructure
}

export function ChapterLayout({
  currentSlug,
  allChapters,
  children,
  chapterOrder,
  totalChapters,
  structure
}: ChapterLayoutProps) {
  // Always initialize as false to avoid hydration mismatch
  const [scrolled, setScrolled] = useState(false)
  const [showStickyNav, setShowStickyNav] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const currentChapterInfo = getChapterInSection(structure, currentSlug)
  const currentSection = currentChapterInfo?.section
  const sectionColor = currentSection ? getSectionColor(currentSection.number) : getSectionColor(1)

  // Check for #content hash on mount and scroll to position
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#content') {
      // Set states immediately for navbar/sidebar visibility
      setScrolled(true)
      setShowStickyNav(true)

      // Scroll to position after banner
      const scrollToContent = () => {
        window.scrollTo({
          top: 700,
          behavior: 'instant'
        })
      }

      scrollToContent()
      setTimeout(scrollToContent, 10)
    }
  }, [currentSlug])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 400)
      // Show sticky nav after scrolling past the banner (header ~88px + hero ~600px)
      setShowStickyNav(scrollY > 650)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <div className="min-h-screen bg-[#DBDADB]/20">
      {/* Sticky Navbar - appears on scroll */}
      <StickyNavbar
        structure={structure}
        currentSlug={currentSlug}
        visible={showStickyNav}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={toggleSidebar}
      />

      {/* Header */}
      <header className="bg-[#3D393D] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-20 py-7 flex items-center justify-between">
          {/* Logo */}
          <div className="text-white">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <span className="text-[#C8D419]">OCP</span>
              <span>Open</span>
            </div>
            <div className="text-sm font-medium">
              Contracting Partnership
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#C8D419] text-black font-semibold rounded hover:bg-[#B5C115] transition-colors"
            >
              Get the playbook
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Dynamic based on current chapter */}
      <div className="bg-[#3D393D] text-white">
        <div className="relative max-w-7xl mx-auto px-20 py-24">
          <div className="flex gap-12 items-center">
            {/* Left: Title - takes less than 50% */}
            <div className="w-[40%]">
              <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-[#23B2A7] to-[#C8D419] bg-clip-text text-transparent leading-tight">
                Buying AI
              </h1>
              <p className="text-2xl text-white/90">
                Tips and tools for the public sector
              </p>
            </div>

            {/* Right: Section Cards - takes more than 50%, no gaps */}
            <div className="flex-1 relative h-[460px] flex items-center">
              {structure.sections.map((section, idx) => {
                const color = getSectionColor(section.number)
                const isCurrentSection = currentSection?.number === section.number
                const baseWidth = isCurrentSection ? 420 : 72
                const firstChapterSlug = section.chapters[0]?.slug

                return (
                  <div
                    key={section.number}
                    className="h-full rounded-tl-lg rounded-tr-[36px] rounded-bl-[36px] rounded-br-lg transition-all duration-300 overflow-hidden"
                    style={{
                      backgroundColor: color.bg,
                      width: `${baseWidth}px`,
                      minWidth: `${baseWidth}px`
                    }}
                  >
                    {isCurrentSection ? (
                      // Expanded card with chapter list
                      <div className="p-8 h-full flex flex-col justify-between">
                        <div>
                          <div className="text-5xl font-bold text-black mb-4">
                            {section.number.toString().padStart(2, '0')}
                          </div>
                          <h3 className="text-2xl font-medium text-black mb-6">
                            {section.title}
                          </h3>

                          {/* Chapter list in current section */}
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
                        </div>

                        <div className="flex items-center gap-2 text-black mt-4">
                          <span className="text-sm font-medium">Open chapter {section.number}</span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-rotate-90">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 8 16 12 12 16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      // Collapsed card - clickable to navigate
                      <Link
                        href={`/chapter/${firstChapterSlug}#content`}
                        scroll={false}
                        className="h-full flex items-start justify-center pt-8 group cursor-pointer hover:scale-105 transition-transform"
                      >
                        <span className="text-5xl font-bold text-black/50 group-hover:text-black/70 transition-colors">
                          {section.number.toString().padStart(2, '0')}
                        </span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Sidebar - Shows after scrolling */}
        <aside
          className={`w-[366px] bg-white border-r border-gray-200 transition-all duration-300 ${
            scrolled && sidebarVisible ? 'sticky h-[calc(100vh-148px)]' : 'absolute -left-full opacity-0'
          }`}
          style={{
            top: showStickyNav ? '148px' : '88px' // Account for header (88px) + chapter navbar (60px)
          }}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-black">Table of content</h2>
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                aria-label="Hide sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav className="space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto">
              {structure.sections.map((section) => {
                const hasCurrentChapter = section.chapters.some(ch => ch.slug === currentSlug)
                const color = getSectionColor(section.number)

                return (
                  <div key={section.number} className="space-y-2">
                    <div
                      className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded inline-block"
                      style={{ backgroundColor: `${color.bg}30`, color: color.bg }}
                    >
                      {section.number.toString().padStart(2, '0')} · {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.chapters.map((ch) => (
                        <Link
                          key={ch.slug}
                          href={`/chapter/${ch.slug}#content`}
                          scroll={false}
                          className={`block px-4 py-2 rounded text-sm transition-colors ${
                            ch.slug === currentSlug
                              ? 'text-black font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                          style={ch.slug === currentSlug ? {
                            backgroundColor: `${color.bg}20`
                          } : {}}
                        >
                          <span className="text-xs opacity-60 font-mono mr-2">
                            {ch.order.toString().padStart(2, '0')}
                          </span>
                          {ch.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 max-w-7xl mx-auto ${scrolled ? 'ml-0' : 'ml-0'}`}>
          <div id="content" className="px-12 py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
