import fs from "node:fs";
import path from "node:path";
import { getSectionsStructure } from "./sections";

interface Chapter {
  slug: string;
  title: string;
  order: number;
  filename: string;
}

export interface ChapterContent extends Chapter {
  content: string;
}

export interface ChapterInSection extends Chapter {
  sectionNumber: number;
  sectionTitle: string;
}

const contentDirectory = path.join(process.cwd(), "content");

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

// Get a single chapter by slug. Its order is 0 if it isn't in the TOC.
export function getChapterBySlug(slug: string): ChapterContent | null {
  try {
    const content = fs.readFileSync(path.join(contentDirectory, `${slug}.md`), "utf8");

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    const order =
      getSectionsStructure()
        .sections.flatMap((section) => section.chapters)
        .find((chapter) => chapter.slug === slug)?.order ?? 0;

    return {
      slug,
      title,
      order,
      filename: `${slug}.md`,
      content,
    };
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
