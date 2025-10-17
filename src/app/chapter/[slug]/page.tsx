import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllChapters, getChapterBySlug, getAdjacentChapters } from '@/lib/markdown'
import { getSectionsStructure } from '@/lib/sections'
import { ChapterLayout } from '@/components/ChapterLayout'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static paths for all chapters
export async function generateStaticParams() {
  const chapters = getAllChapters()
  return chapters.map((chapter) => ({
    slug: chapter.slug
  }))
}

// Generate metadata for each chapter
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const chapter = getChapterBySlug(slug)

  if (!chapter) {
    return {
      title: 'Chapter Not Found'
    }
  }

  return {
    title: `${chapter.title} - Buying AI`
  }
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params
  const chapter = getChapterBySlug(slug)

  if (!chapter) {
    notFound()
  }

  const allChapters = getAllChapters().filter(ch => ch.slug !== '00-toc')
  const { previous, next } = getAdjacentChapters(slug)
  const structure = getSectionsStructure()

  return (
    <ChapterLayout
      currentSlug={slug}
      allChapters={allChapters}
      chapterOrder={chapter.order}
      totalChapters={allChapters.length}
      structure={structure}
    >
      <div className="max-w-3xl mx-auto">
        {/* Content Card */}
        <article className="bg-white rounded-lg shadow-sm p-12 mb-8">
          <div className="prose prose-slate max-w-none
            prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-[#23B2A7] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-gray-700 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-[#C8D419] prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-gray-200 prose-hr:my-8
          ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt, ...props }) => {
                  // Only render image if src is valid
                  if (!src) return null
                  return <img src={src} alt={alt || ''} {...props} />
                }
              }}
            >
              {chapter.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {previous && (
              <Link
                href={`/chapter/${previous.slug}#content`}
                scroll={false}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Previous</div>
                  <div className="font-medium">{previous.title}</div>
                </div>
              </Link>
            )}
          </div>
          <div className="text-right">
            {next && (
              <Link
                href={`/chapter/${next.slug}#content`}
                scroll={false}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
              >
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Next</div>
                  <div className="font-medium">{next.title}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  )
}

