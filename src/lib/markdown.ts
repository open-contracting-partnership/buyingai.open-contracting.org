import fs from 'fs'
import path from 'path'

export interface Chapter {
  slug: string
  title: string
  order: number
  filename: string
}

export interface ChapterContent extends Chapter {
  content: string
}

const contentDirectory = path.join(process.cwd(), 'content')

// Get all chapters from the content directory
export function getAllChapters(): Chapter[] {
  const files = fs.readdirSync(contentDirectory)
  
  const chapters = files
    .filter(file => file.endsWith('.md'))
    .map(filename => {
      const slug = filename.replace(/\.md$/, '')
      const content = fs.readFileSync(path.join(contentDirectory, filename), 'utf8')
      
      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : slug
      
      // Extract order from filename prefix (e.g., "01-" => 1)
      const orderMatch = filename.match(/^(\d+)/)
      const order = orderMatch ? parseInt(orderMatch[1], 10) : 999
      
      return {
        slug,
        title,
        order,
        filename
      }
    })
    .sort((a, b) => a.order - b.order)
  
  return chapters
}

// Get a single chapter by slug
export function getChapterBySlug(slug: string): ChapterContent | null {
  try {
    const filePath = path.join(contentDirectory, `${slug}.md`)
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : slug
    
    // Extract order from filename prefix
    const orderMatch = slug.match(/^(\d+)/)
    const order = orderMatch ? parseInt(orderMatch[1], 10) : 999
    
    return {
      slug,
      title,
      order,
      filename: `${slug}.md`,
      content
    }
  } catch (error) {
    return null
  }
}

// Get previous and next chapters
export function getAdjacentChapters(slug: string) {
  const chapters = getAllChapters()
  const currentIndex = chapters.findIndex(ch => ch.slug === slug)
  
  return {
    previous: currentIndex > 0 ? chapters[currentIndex - 1] : null,
    next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null
  }
}

