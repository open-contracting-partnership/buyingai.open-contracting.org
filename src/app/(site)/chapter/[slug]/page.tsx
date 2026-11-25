import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterLayout } from "@/components/ChapterLayout";
import { ChapterTitle, plainText } from "@/components/ChapterTitle";
import { CollapsibleInitializer } from "@/components/CollapsibleInitializer";
import { SITE_URL } from "@/lib/links";
import {
  type ChapterPageProps,
  getAdjacentChapters,
  getChapterBySlug,
  getChapterColor,
  getChapterParams,
} from "@/lib/markdown";
import { OG_IMAGE, OPEN_GRAPH } from "@/lib/metadata";
import { getSectionsStructure } from "@/lib/sections";

export async function generateStaticParams() {
  return getChapterParams();
}

// Generate metadata for each chapter
export async function generateMetadata({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: "Chapter Not Found",
    };
  }

  const title = plainText(chapter.title);

  // The Who/What box's "What" line, or else the first paragraph.
  const what = chapter.content.match(/^- What:(.+)$/m)?.[1];
  const firstParagraph = chapter.content
    .split("\n\n")
    .find((p) => p.trim().length > 50 && !p.trim().startsWith("#") && !p.trim().startsWith("```"));
  let description = plainText(
    what ?? firstParagraph ?? `Read ${title} - Buying AI guide by Open Contracting Partnership.`,
  );
  if (description.length > 160) {
    description = `${description.substring(0, description.lastIndexOf(" ", 159))}…`;
  }

  const pageTitle = `${title} - Buying AI`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      ...OPEN_GRAPH,
      title: pageTitle,
      description,
      url: `${SITE_URL}/chapter/${slug}`,
      images: [{ ...OG_IMAGE, alt: title }],
      type: "article",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const { previous, next } = getAdjacentChapters(slug);
  const structure = getSectionsStructure();
  const sectionColor = getChapterColor(slug);

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
                <span className="text-sm">
                  <ChapterTitle title={previous.title} />
                </span>
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
                <span className="text-sm">
                  <ChapterTitle title={next.title} />
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
}
