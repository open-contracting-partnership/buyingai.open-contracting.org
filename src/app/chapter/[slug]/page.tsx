import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import React from 'react'
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
            prose-code:bg-transparent prose-code:p-0
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-gray-200 prose-hr:my-8
            prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:my-6
            prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-th:text-sm
            prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-td:text-sm
            prose-thead:bg-gray-50
            prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:overflow-visible
          ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt, ...props }) => {
                  // Only render image if src is valid
                  if (!src) return null
                  return <img src={src} alt={alt || ''} {...props} />
                },
                pre: ({ children, ...props }: any) => {
                  // Get the text content from children
                  let content = ''
                  if (typeof children === 'string') {
                    content = children
                  } else if (React.isValidElement(children) && children.props.children) {
                    content = String(children.props.children)
                  }
                  
                  content = content.trim()
                  if (!content) {
                    return null
                  }
                  
                  const lines = content.split('\n')
                  
                  // Check if it's a Who/What box
                  const whoLine = lines.find(line => line.trim().startsWith('- Who:'))
                  const whatLine = lines.find(line => line.trim().startsWith('- What:'))
                  
                  if (whoLine && whatLine) {
                    const whoContent = whoLine.replace(/^-\s*Who:\s*/, '').trim()
                    const whatContent = whatLine.replace(/^-\s*What:\s*/, '').trim()
                    
                    return (
                      <div className="not-prose my-6 px-8 py-5 bg-[#F5F7E6] rounded-2xl">
                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '80px', fontWeight: 'bold', color: '#8B9A2E', fontSize: '1.125rem', paddingRight: '1.5rem', verticalAlign: 'top', paddingBottom: '0.75rem', border: 'none' }}>Who</td>
                              <td style={{ color: '#1f2937', fontSize: '1rem', paddingBottom: '0.75rem', border: 'none', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{whoContent}</td>
                            </tr>
                            <tr>
                              <td style={{ width: '80px', fontWeight: 'bold', color: '#8B9A2E', fontSize: '1.125rem', paddingRight: '1.5rem', verticalAlign: 'top', border: 'none' }}>What</td>
                              <td style={{ color: '#1f2937', fontSize: '1rem', border: 'none', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{whatContent}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )
                  }
                  
                  // Check if it's a resource/info box
                  const firstLine = lines[0]
                  const hasBullets = lines.some(line => line.trim().startsWith('-'))
                  
                  if (firstLine && hasBullets && !firstLine.startsWith('-')) {
                    const title = firstLine.trim()
                    // Keep all content after the title, preserving empty lines
                    const bulletContent = lines.slice(1).join('\n').trim()
                    
                    return (
                      <div className="my-8 -mx-12 px-12 py-6 bg-[#F5F7E6]">
                        <h4 className="font-bold text-gray-900 text-lg mb-4">{title}</h4>
                        <div className="prose prose-sm max-w-none prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:text-gray-700 prose-li:leading-relaxed prose-p:my-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#23B2A7] prose-a:no-underline hover:prose-a:underline">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{bulletContent}</ReactMarkdown>
                        </div>
                      </div>
                    )
                  }
                  
                  // Regular code block - hide it
                  return null
                },
                code: ({ inline, children, ...props }: any) => {
                  // Only handle inline code here
                  if (inline) {
                    return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>{children}</code>
                  }
                  // Block code is handled by pre component
                  return <code {...props}>{children}</code>
                },
                table: ({ children, ...props }) => {
                  // Check if this is a header-only table by examining the children
                  const hasOnlyHeaders = React.Children.toArray(children).every(child => {
                    if (React.isValidElement(child) && child.type === 'thead') {
                      return true
                    }
                    if (React.isValidElement(child) && child.type === 'tbody') {
                      // Check if tbody has any tr children
                      const tbodyChildren = React.Children.toArray(child.props.children)
                      return tbodyChildren.length === 0 || 
                        tbodyChildren.every(tr => 
                          React.isValidElement(tr) && tr.type === 'tr' && 
                          React.Children.toArray(tr.props.children).every(td => 
                            React.isValidElement(td) && td.type === 'td' && 
                            (!td.props.children || 
                             (typeof td.props.children === 'string' && td.props.children.trim() === '') ||
                             (Array.isArray(td.props.children) && td.props.children.every(c => 
                               typeof c === 'string' && c.trim() === '')))
                          )
                        )
                    }
                    return false
                  })

                  if (hasOnlyHeaders) {
                    return (
                      <div className="my-6 px-6 py-4 bg-[#F5F7E6] border-l-4 border-[#8B9A2E] rounded-xl">
                        <table className="w-full" {...props}>
                          {children}
                        </table>
                      </div>
                    )
                  }

                  return (
                    <table className="w-full border-collapse border border-gray-300" {...props}>
                      {children}
                    </table>
                  )
                },
                thead: ({ children, ...props }) => {
                  return (
                    <thead {...props}>
                      {children}
                    </thead>
                  )
                },
                th: ({ children, ...props }) => {
                  return (
                    <th className="px-0 py-2 text-left font-semibold text-base text-gray-900 border-0" {...props}>
                      {children}
                    </th>
                  )
                },
                tr: ({ children, ...props }) => {
                  return (
                    <tr className="border-0" {...props}>
                      {children}
                    </tr>
                  )
                },
                td: ({ children, ...props }) => {
                  return (
                    <td className="border border-gray-300 px-4 py-2 text-sm" {...props}>
                      {children}
                    </td>
                  )
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

