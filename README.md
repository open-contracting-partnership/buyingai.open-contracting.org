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

## Accessibility

Install Chrome for Pa11y, build the site (without PDFs) and serve it:

```bash
pnpm exec puppeteer browsers install chrome
pnpm exec tsx scripts/serve.ts
```

Check the sitemap's pages, and the pages in `pa11y.default.js`, for errors, then warnings, as in the `a11y.yml` workflow. Repeat each command with `pa11y.mobile.js`:

```bash
env PA11Y_STRATEGY=ignore pnpm exec pa11y-ci -c pa11y.default.js -s http://127.0.0.1:8000/sitemap.xml -f https://buyingai.open-contracting.org -r http://127.0.0.1:8000
env PA11Y_INCLUDE_WARNINGS=1 PA11Y_SUPPRESS_KNOWN_WARNINGS=1 PA11Y_STRATEGY=ignore pnpm exec pa11y-ci -c pa11y.default.js -s http://127.0.0.1:8000/sitemap.xml -f https://buyingai.open-contracting.org -r http://127.0.0.1:8000
env PA11Y_INCLUDE_WARNINGS=1 PA11Y_SUPPRESS_KNOWN_WARNINGS=1 PA11Y_STRATEGY=hideElements pnpm exec pa11y-ci -c pa11y.default.js -s http://127.0.0.1:8000/sitemap.xml -f https://buyingai.open-contracting.org -r http://127.0.0.1:8000
```

Omit `PA11Y_SUPPRESS_KNOWN_WARNINGS` to review all warnings, including the known warnings in `pa11y.default.js`.

## Content

`content/00-toc.md` sets the sections and the order of chapters. `content/glossary.csv` sets the glossary terms.

Each other file in `content/` is a chapter: `NN-slug.md`, served at `/chapter/NN-slug`. It starts with a `# Title` heading. Its line in `00-toc.md` must start like its slug, without the number. The number is only part of the URL, so a new chapter takes the next unused number, wherever it goes in `00-toc.md`.

Chapters can use:

- `#### **Title {.collapsible}**` or `* **Title: {.collapsible}**` to collapse the content that follows, on the website
- `{#id}` at the end of a heading, to set its ID
- A fenced code block with `- Who:` and `- What:` lines, for the box at the start of a chapter
- A fenced code block with `icon` and `background` front matter, or with a heading and bullets, for a callout box
- `[PROCUREMENT_PATHWAYS]`, for the table in `src/app/data/procurement-pathways.json`

When copying Markdown from Google Docs, check line breaks, image links and headings.

## License

The code is licensed under the MIT License, and the content under CC BY 4.0. See [LICENSE.md](LICENSE.md).
