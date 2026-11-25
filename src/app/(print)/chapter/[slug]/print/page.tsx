import { notFound } from "next/navigation";
import { ChapterContent } from "@/components/ChapterContent";
import { plainText } from "@/components/ChapterTitle";
import { CollapsibleInitializer } from "@/components/CollapsibleInitializer";
import { type ChapterPageProps, getChapterBySlug, getChapterColor, getChapterParams } from "@/lib/markdown";

export async function generateStaticParams() {
  return getChapterParams();
}

// The title becomes the generated PDF's title.
export async function generateMetadata({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) {
    return {};
  }
  return { title: `${plainText(chapter.title)} - Buying AI` };
}

export default async function PrintPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const sectionColor = getChapterColor(slug);

  return (
    <div className="min-h-screen bg-white print-view-container">
      <main className="print-content-wrapper px-8 py-8 max-w-4xl mx-auto">
        <article className="print-content">
          <ChapterContent content={chapter.content} highlightColor={sectionColor.bg} print />
        </article>
      </main>

      <CollapsibleInitializer />
    </div>
  );
}
