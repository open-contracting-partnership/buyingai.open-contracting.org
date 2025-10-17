import Link from 'next/link'
import { getAllChapters } from '@/lib/markdown'
import { getSectionsStructure } from '@/lib/sections'
import { getSectionColor } from '@/lib/sections-types'

export default function Home() {
  const chapters = getAllChapters().filter(ch => ch.slug !== '00-toc')
  const structure = getSectionsStructure()

  return (
    <div className="min-h-screen bg-[#3D393D] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
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
            <button className="p-2 hover:bg-white/10 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <Link
              href="/chapter/01-introduction"
              className="px-6 py-2.5 bg-[#C8D419] text-black font-semibold rounded hover:bg-[#B5C115] transition-colors"
            >
              Get the playbook
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
              const isFirst = idx === 0
              const baseWidth = isFirst ? 420 : 72
              const firstChapterSlug = section.chapters[0]?.slug

              return (
                <Link
                  key={section.number}
                  href={`/chapter/${firstChapterSlug}`}
                  className="h-full rounded-tl-lg rounded-tr-[36px] rounded-bl-[36px] rounded-br-lg transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: color.bg,
                    width: `${baseWidth}px`,
                    minWidth: `${baseWidth}px`
                  }}
                >
                  {isFirst ? (
                    // Expanded first card
                    <div className="p-8 h-full flex flex-col justify-between">
                      <div>
                        <div className="text-5xl font-bold text-black mb-4">
                          {section.number.toString().padStart(2, '0')}
                        </div>
                        <h3 className="text-2xl font-medium text-black">
                          {section.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-black">
                        <span className="text-base font-medium">Begin here</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-rotate-90">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 8 16 12 12 16"/>
                          <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    // Collapsed cards
                    <div className="h-full flex items-start justify-center pt-8">
                      <span className="text-3xl font-medium text-black/50 group-hover:text-black/70 transition-colors">
                        {section.number.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="max-w-7xl mx-auto px-20 py-12">
        <nav>
          <ol className="space-y-3">
            {chapters.map((chapter) => (
              <li key={chapter.slug}>
                <Link
                  href={`/chapter/${chapter.slug}`}
                  className="block p-4 border border-white/10 rounded hover:bg-white/5 hover:border-white/20 transition-colors"
                >
                  <span className="text-sm text-white/60 font-mono">
                    {chapter.order.toString().padStart(2, '0')}
                  </span>
                  <h2 className="text-lg font-medium text-white mt-1">
                    {chapter.title}
                  </h2>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/10 text-center text-sm text-white/60">
        <p>Open Contracting Partnership</p>
      </footer>
    </div>
  )
}
