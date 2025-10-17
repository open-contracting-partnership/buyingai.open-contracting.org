# Buying GenAI - eBook Website

A Next.js website that renders markdown content as an interactive ebook with chapter navigation.

## Project Structure

```
ocp-ai-buying/
├── content/              # Markdown files for book chapters
│   ├── 00-toc.md
│   ├── 01-introduction.md
│   ├── 02-gen-ai-adoption-in-government.md
│   └── ...
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page (table of contents)
│   │   ├── chapter/[slug]/page.tsx     # Dynamic chapter pages
│   │   └── ...
│   └── lib/
│       └── markdown.ts                  # Utilities for reading markdown files
└── package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Adding or Editing Content

1. Place markdown files in the `content/` directory
2. Name files with a numeric prefix for ordering: `01-chapter-name.md`, `02-next-chapter.md`, etc.
3. Start each file with a heading (`# Title`) - this will be used as the chapter title
4. The site automatically generates:
   - A table of contents on the home page
   - Individual URLs for each chapter (`/chapter/01-chapter-name`)
   - Previous/Next navigation between chapters

## Markdown from Google Docs

When exporting markdown from Google Docs, you may need to:
- Clean up extra line breaks
- Fix image links
- Ensure headings use proper markdown syntax (`#`, `##`, etc.)

## Building for Production

```bash
npm run build
npm start
```

## Figma Integration

To fetch the latest design data from Figma:

1. **Get your Figma credentials:**
   - Personal Access Token: [Figma Account Settings](https://www.figma.com/settings) → Generate new token
   - File Key: From your Figma URL `figma.com/file/FILE_KEY/...`

2. **Create `.env` file:**
   ```bash
   FIGMA_ACCESS_TOKEN=your_token_here
   FIGMA_FILE_KEY=your_file_key_here
   FIGMA_PROJECT_ID=your_project_id_here  # Optional, for listing files
   ```

3. **Fetch Figma data:**
   
   **List all files in a project:**
   ```bash
   npm run figma:fetch -- --list-files PROJECT_ID
   # Or set FIGMA_PROJECT_ID in .env and run:
   npm run figma:fetch -- --list-files
   ```
   
   **List all pages in a file:**
   ```bash
   npm run figma:fetch -- --list-pages
   ```
   
   **Fetch a specific page:**
   ```bash
   npm run figma:fetch -- --page PAGE_ID
   ```
   
   **Fetch entire file:**
   ```bash
   npm run figma:fetch
   ```
   
   **Fetch specific nodes by ID:**
   ```bash
   npm run figma:fetch -- --nodes NODE_ID1 NODE_ID2
   ```
   
   **Tips:**
   - To get page IDs: Run `--list-pages` first
   - To get a node ID: Right-click on a frame/component in Figma → "Copy link" → The node ID is the part after `?node-id=` (e.g., `123:456`)
   - To get a project ID: Open your Figma project → Check the URL → `figma.com/files/PROJECT_ID/...`

**Output:**
- Project files list: `figma-api-data/project-files.json`
- Pages list: `figma-api-data/pages-list.json`
- Specific page: `figma-api-data/page-{name}.json`
- Entire file: `figma-api-data/figma-file.json`
- Specific nodes: `figma-api-data/figma-nodes.json`

You can customize the script in `scripts/fetch-figma.ts` to extract specific design tokens, colors, typography, etc.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub Flavored Markdown support
- **@tailwindcss/typography** - Prose styling for markdown content
# ocp-ai-buying
