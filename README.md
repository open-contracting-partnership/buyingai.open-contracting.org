# BuyingAI: Tips and tools for public procurement

The website at <https://buyingai.open-contracting.org>: a Next.js static site that renders the guidance's Markdown chapters, and a PDF of each chapter.

## Getting started

Install [Node](https://nodejs.org) 24 and [pnpm](https://pnpm.io). To build the PDFs, install [Google Chrome](https://www.google.com/chrome/).

Install dependencies:

```bash
pnpm install
```

Generate the chapters structure and glossary from `content/`:

```bash
pnpm exec tsx scripts/build-content.ts
```

Run the development server, and open <http://localhost:3000>:

```bash
pnpm exec next dev --turbopack
```

## Build

Generate the content, build the static site to `out/`, and print each chapter's print page to `out/pdfs/`:

```bash
pnpm exec tsx scripts/build-content.ts
pnpm exec next build --turbopack
pnpm exec tsx scripts/build-pdfs.ts
```

The PDFs' page header uses GT Eesti Text if it's installed. Otherwise, it falls back to Helvetica or Arial. The deploy workflow installs it with `scripts/install-fonts.py`.

The deploy workflow builds the site on each push to `main`, and pushes `out/` to the `gh-pages` branch, which Cloudflare Pages serves.

## Content

`content/00-toc.md` sets the sections and the order of chapters. `content/glossary.csv` sets the glossary terms.

Each other file in `content/` is a chapter: `NN-slug.md`, served at `/chapter/NN-slug`. It starts with a `# Title` heading.

Chapters can use:

- `#### **Title {.collapsible}**` or `* **Title: {.collapsible}**` to collapse the content that follows, on the website
- `{#id}` at the end of a heading, to set its ID
- A fenced code block with `- Who:` and `- What:` lines, for the box at the start of a chapter
- A fenced code block with `icon` and `background` front matter, or with a heading and bullets, for a callout box
- `[PROCUREMENT_PATHWAYS]`, for the table in `src/app/data/procurement-pathways.json`

When copying Markdown from Google Docs, check line breaks, image links and headings.

## License

The code is licensed under the MIT License, and the content under CC BY 4.0. See [LICENSE.md](LICENSE.md).
