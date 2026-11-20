import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterLayout } from "@/components/ChapterLayout";
import { CollapsibleInitializer } from "@/components/CollapsibleInitializer";
import { SITE_URL } from "@/lib/links";
import { getAdjacentChapters, getAllChapters, getChapterBySlug } from "@/lib/markdown";
import { getSectionsStructure } from "@/lib/sections";
import { getChapterInSection, getSectionColor } from "@/lib/sections-types";

// Helper function to render markdown in navigation titles (handles italics)
function renderTitleMarkdown(title: string): React.ReactNode {
  // Split by italic markers (* or _)
  const parts: React.ReactNode[] = [];
  const italicRegex = /\*([^*]+)\*/g;
  let lastIndex = 0;
  for (const match of title.matchAll(italicRegex)) {
    // Add text before the italic
    if (match.index > lastIndex) {
      parts.push(title.substring(lastIndex, match.index));
    }
    // Add italic text with green background
    parts.push(
      <span key={match.index} className="bg-green-200 px-1 py-0.5 rounded not-italic">
        {match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < title.length) {
    parts.push(title.substring(lastIndex));
  }

  return parts.length > 0 ? parts : title;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static paths for all chapters
export async function generateStaticParams() {
  return getAllChapters().map((chapter) => ({ slug: chapter.slug }));
}

// Generate metadata for each chapter
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: "Chapter Not Found",
    };
  }

  const chapterUrl = `${SITE_URL}/chapter/${slug}`;

  // Extract description from chapter content (first paragraph or first 160 chars)
  let description = `Read ${chapter.title} - Buying AI guide by Open Contracting Partnership.`;
  const firstParagraph = chapter.content.split("\n\n").find((p) => p.trim().length > 50 && !p.trim().startsWith("#"));
  if (firstParagraph) {
    description = `${firstParagraph.trim().replace(/\n/g, " ").substring(0, 160)}...`;
  }

  return {
    title: `${chapter.title} - Buying AI`,
    description,
    openGraph: {
      title: `${chapter.title} - Buying AI`,
      description,
      url: chapterUrl,
      siteName: "Open Contracting Partnership",
      images: [
        {
          url: "/images/og-image.png", // Ruta de la imagen OG - coloca tu imagen en public/og-image.png
          width: 1200,
          height: 630,
          alt: chapter.title,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${chapter.title} - Buying AI`,
      description,
      images: ["/images/og-image.png"], // Ruta de la imagen OG - coloca tu imagen en public/og-image.png
    },
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const { previous, next } = getAdjacentChapters(slug);
  const structure = getSectionsStructure();
  const currentSection = getChapterInSection(structure, slug)?.section;
  const sectionColor = getSectionColor(currentSection?.number ?? 1);

  return (
    <ChapterLayout currentSlug={slug} structure={structure}>
      <div className="max-w-3xl mx-auto">
        <article className="bg-white rounded-lg shadow-sm p-4 sm:p-8 pt-12 lg:p-12 mb-8">
          <ChapterContent content={chapter.content} highlightColor={sectionColor.bg} />
        </article>

        <CollapsibleInitializer />

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {previous && (
              <Link
                href={`/chapter/${encodeURIComponent(previous.slug)}#content`}
                scroll={false}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">{renderTitleMarkdown(previous.title)}</span>
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link
                href={`/chapter/${encodeURIComponent(next.slug)}#content`}
                scroll={false}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
              >
                <span className="text-sm">{renderTitleMarkdown(next.title)}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
}
