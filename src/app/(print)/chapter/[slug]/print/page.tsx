import { notFound } from "next/navigation";
import { ChapterContent } from "@/components/ChapterContent";
import { plainText } from "@/components/ChapterTitle";
import { ChromeContentFix } from "@/components/ChromeContentFix";
import { CollapsibleInitializer } from "@/components/CollapsibleInitializer";
import { getAllChapters, getChapterBySlug } from "@/lib/markdown";
import { getSectionsStructure } from "@/lib/sections";
import { getChapterInSection, getSectionColor } from "@/lib/sections-types";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return getAllChapters().map((chapter) => ({ slug: chapter.slug }));
}

// The title becomes the generated PDF's title.
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) {
    return {};
  }
  return { title: `${plainText(chapter.title)} - Buying AI` };
}

export default async function PrintPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const currentSection = getChapterInSection(getSectionsStructure(), slug)?.section;
  const sectionColor = getSectionColor(currentSection?.number ?? 1);
  const visible = { display: "block", visibility: "visible", opacity: 1 } as const;

  return (
    <div className="min-h-screen bg-white print-view-container" style={visible}>
      <main className="print-content-wrapper px-8 py-8 max-w-4xl mx-auto" style={visible}>
        <article className="print-content" style={visible}>
          <ChapterContent content={chapter.content} highlightColor={sectionColor.bg} print />
        </article>
      </main>

      <ChromeContentFix />
      <CollapsibleInitializer />
    </div>
  );
}
