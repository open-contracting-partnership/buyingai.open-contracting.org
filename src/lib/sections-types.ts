// Client-safe types and utilities for sections
export interface SectionChapter {
  slug: string
  title: string
  order: number
  note?: string
}

export interface Section {
  number: number
  title: string
  chapters: SectionChapter[]
}

export interface SectionsStructure {
  title: string
  sections: Section[]
  metadata: {
    totalSections: number
    totalChapters: number
    version: string
    lastUpdated: string
  }
}

// Color scheme for sections (from yellow-green to teal)
export const sectionColors = [
  { bg: '#C8D419', text: '#000000', label: 'bg-[#C8D419] text-black' },     // Section 1 - Yellow-green
  { bg: '#AEC64E', text: '#000000', label: 'bg-[#AEC64E] text-black' },     // Section 2 - Light green
  { bg: '#92BA6C', text: '#000000', label: 'bg-[#92BA6C] text-black' },     // Section 3 - Medium green
  { bg: '#6CBA8C', text: '#000000', label: 'bg-[#6CBA8C] text-black' },     // Section 4 - Teal-green
  { bg: '#23B2A7', text: '#000000', label: 'bg-[#23B2A7] text-black' },     // Section 5 - Teal
]

export function getSectionColor(sectionNumber: number) {
  return sectionColors[sectionNumber - 1] || sectionColors[0]
}

export function getSectionForChapter(structure: SectionsStructure, slug: string): Section | null {
  for (const section of structure.sections) {
    if (section.chapters.some(ch => ch.slug === slug)) {
      return section
    }
  }
  return null
}

export function getChapterInSection(structure: SectionsStructure, slug: string): { section: Section; chapterIndex: number } | null {
  for (const section of structure.sections) {
    const chapterIndex = section.chapters.findIndex(ch => ch.slug === slug)
    if (chapterIndex !== -1) {
      return { section, chapterIndex }
    }
  }
  return null
}
