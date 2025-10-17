/**
 * Script to fetch design data from Figma API
 * 
 * Usage:
 * 1. Create .env with FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY
 * 2. Run: npm run figma:fetch
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY
const FIGMA_PROJECT_ID = process.env.FIGMA_PROJECT_ID

async function fetchFigmaFile() {
  console.log('🎨 Fetching Figma file data...')
  
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`
  console.log('📍 API URL:', url)
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN!
      }
    })
    
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Save the full response
    const outputDir = path.join(process.cwd(), 'figma-api-data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const outputPath = path.join(outputDir, 'figma-file.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    
    console.log('✅ Success! Figma data saved to:', outputPath)
    console.log('\nFile info:')
    console.log('- Name:', data.name)
    console.log('- Last Modified:', data.lastModified)
    console.log('- Version:', data.version)
    
    return data
  } catch (error) {
    console.error('❌ Error fetching Figma data:', error)
    process.exit(1)
  }
}

async function extractDesignTokens(figmaData: any) {
  console.log('\n🎨 Extracting design tokens...')
  
  // Example: Extract colors, typography, etc.
  // You can customize this based on your Figma structure
  
  const tokens = {
    colors: {},
    typography: {},
    spacing: {},
    extractedAt: new Date().toISOString()
  }
  
  // This is a basic example - customize based on your needs
  const outputPath = path.join(process.cwd(), 'figma-api-data', 'design-tokens.json')
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2))
  
  console.log('✅ Design tokens saved to:', outputPath)
}

async function listProjectFiles(projectId?: string) {
  const pid = projectId || FIGMA_PROJECT_ID
  
  if (!pid) {
    console.error('❌ Error: Missing FIGMA_PROJECT_ID')
    console.error('Please set FIGMA_PROJECT_ID in .env or pass it as an argument')
    console.log('Usage: npm run figma:fetch -- --list-files PROJECT_ID')
    process.exit(1)
  }
  
  console.log('📋 Listing files in project...')
  
  const url = `https://api.figma.com/v1/projects/${pid}/files`
  console.log('📍 API URL:', url)
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN!
      }
    })
    
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Save the response
    const outputDir = path.join(process.cwd(), 'figma-api-data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const outputPath = path.join(outputDir, 'project-files.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    
    console.log('✅ Success! Project files list saved to:', outputPath)
    console.log('\nFiles in project:')
    data.files.forEach((file: any) => {
      console.log(`  - ${file.name} (${file.key})`)
    })
    
    return data
  } catch (error) {
    console.error('❌ Error listing project files:', error)
    process.exit(1)
  }
}

async function listPages() {
  if (!FIGMA_FILE_KEY) {
    console.error('❌ Error: Missing FIGMA_FILE_KEY')
    console.error('Please set FIGMA_FILE_KEY in .env')
    process.exit(1)
  }
  
  console.log('📄 Listing pages in file...')
  
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN!
      }
    })
    
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Pages in file:')
    const pages = data.document.children.filter((child: any) => child.type === 'CANVAS')
    
    pages.forEach((page: any, index: number) => {
      console.log(`  ${index + 1}. ${page.name} (ID: ${page.id})`)
    })
    
    // Save page list
    const outputDir = path.join(process.cwd(), 'figma-api-data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const pageList = pages.map((page: any) => ({
      name: page.name,
      id: page.id
    }))
    
    const outputPath = path.join(outputDir, 'pages-list.json')
    fs.writeFileSync(outputPath, JSON.stringify(pageList, null, 2))
    console.log('\n📝 Page list saved to:', outputPath)
    
    return pages
  } catch (error) {
    console.error('❌ Error listing pages:', error)
    process.exit(1)
  }
}

async function fetchPage(pageId: string) {
  if (!FIGMA_FILE_KEY) {
    console.error('❌ Error: Missing FIGMA_FILE_KEY')
    console.error('Please set FIGMA_FILE_KEY in .env')
    process.exit(1)
  }
  
  console.log('📄 Fetching specific page...')
  
  // URL encode the page ID (in case it has special characters like :)
  const encodedPageId = encodeURIComponent(pageId)
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/nodes?ids=${encodedPageId}`
  console.log('📍 API URL:', url)
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN!
      }
    })
    
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Save the response
    const outputDir = path.join(process.cwd(), 'figma-api-data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const pageName = data.nodes[pageId]?.document?.name || 'page'
    const sanitizedName = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const outputPath = path.join(outputDir, `page-${sanitizedName}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    
    console.log('✅ Success! Page data saved to:', outputPath)
    console.log('Page name:', pageName)
    
    return data
  } catch (error) {
    console.error('❌ Error fetching page:', error)
    process.exit(1)
  }
}

async function fetchFigmaNodes(nodeIds: string[]) {
  console.log('🎨 Fetching specific Figma nodes...')
  
  // Join node IDs with comma for the API
  const idsParam = nodeIds.join(',')
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/nodes?ids=${idsParam}`
  console.log('📍 API URL:', url)
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN!
      }
    })
    
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Save the response
    const outputDir = path.join(process.cwd(), 'figma-api-data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const outputPath = path.join(outputDir, 'figma-nodes.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    
    console.log('✅ Success! Node data saved to:', outputPath)
    console.log('\nFetched nodes:', Object.keys(data.nodes || {}))
    
    return data
  } catch (error) {
    console.error('❌ Error fetching Figma nodes:', error)
    process.exit(1)
  }
}

// Main execution
async function main() {
  // Check command line arguments
  const args = process.argv.slice(2)
  
  if (args.includes('--list-files') || args.includes('-l')) {
    // List files in a project
    // Usage: npm run figma:fetch -- --list-files [PROJECT_ID]
    const listIndex = args.findIndex(arg => arg === '--list-files' || arg === '-l')
    const projectId = args[listIndex + 1]
    
    await listProjectFiles(projectId)
  } else if (args.includes('--list-pages')) {
    // List pages in the current file
    // Usage: npm run figma:fetch -- --list-pages
    await listPages()
  } else if (args.includes('--page') || args.includes('-p')) {
    // Fetch a specific page
    // Usage: npm run figma:fetch -- --page PAGE_ID
    const pageIndex = args.findIndex(arg => arg === '--page' || arg === '-p')
    const pageId = args[pageIndex + 1]
    
    if (!pageId) {
      console.error('❌ Error: Please provide a page ID')
      console.log('Usage: npm run figma:fetch -- --page PAGE_ID')
      console.log('Tip: Run "npm run figma:fetch -- --list-pages" to see available pages')
      process.exit(1)
    }
    
    await fetchPage(pageId)
  } else if (args.includes('--nodes') || args.includes('-n')) {
    // Fetch specific nodes
    // Usage: npm run figma:fetch -- --nodes NODE_ID1 NODE_ID2
    if (!FIGMA_FILE_KEY) {
      console.error('❌ Error: Missing FIGMA_FILE_KEY')
      console.error('Please set FIGMA_FILE_KEY in .env')
      process.exit(1)
    }
    
    const nodeIndex = args.findIndex(arg => arg === '--nodes' || arg === '-n')
    const nodeIds = args.slice(nodeIndex + 1)
    
    if (nodeIds.length === 0) {
      console.error('❌ Error: Please provide at least one node ID')
      console.log('Usage: npm run figma:fetch -- --nodes NODE_ID1 NODE_ID2')
      process.exit(1)
    }
    
    await fetchFigmaNodes(nodeIds)
  } else {
    // Fetch entire file
    if (!FIGMA_FILE_KEY) {
      console.error('❌ Error: Missing FIGMA_FILE_KEY')
      console.error('Please set FIGMA_FILE_KEY in .env')
      process.exit(1)
    }
    
    const figmaData = await fetchFigmaFile()
    
    // Optionally extract design tokens
    // await extractDesignTokens(figmaData)
  }
}

main()

