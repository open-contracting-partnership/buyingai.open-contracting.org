import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIRECTORY, getSectionsStructure } from "./sections";
import { getChapterInSection, getSectionColor } from "./sections-types";

interface Chapter {
  slug: string;
  title: string;
}

export interface ChapterContent extends Chapter {
  content: string;
}

export interface ChapterInSection extends Chapter {
  sectionNumber: number;
  sectionTitle: string;
}

export interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

// The static params of the chapter pages and print pages.
export function getChapterParams() {
  return getAllChapters().map((chapter) => ({ slug: chapter.slug }));
}

// The color of the chapter's section.
export function getChapterColor(slug: string) {
  return getSectionColor(getChapterInSection(getSectionsStructure(), slug)?.section.number ?? 1);
}

// The chapters in content/00-toc.md, in its order.
export function getAllChapters(): ChapterInSection[] {
  return getSectionsStructure().sections.flatMap((section) =>
    section.chapters
      .map((chapter) => getChapterBySlug(chapter.slug))
      .filter((chapter) => chapter !== null)
      .map(({ content: _content, ...chapter }) => ({
        ...chapter,
        sectionNumber: section.number,
        sectionTitle: section.title,
      })),
  );
}

// Get a single chapter by slug.
export function getChapterBySlug(slug: string): ChapterContent | null {
  try {
    const content = fs.readFileSync(path.join(CONTENT_DIRECTORY, `${slug}.md`), "utf8");

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    return { slug, title, content };
  } catch {
    return null;
  }
}

// Get previous and next chapters
export function getAdjacentChapters(slug: string) {
  const chapters = getAllChapters();
  const currentIndex = chapters.findIndex((ch) => ch.slug === slug);

  return {
    previous: currentIndex > 0 ? chapters[currentIndex - 1] : null,
    next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
  };
}
