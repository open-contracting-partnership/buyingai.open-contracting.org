import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { SITE_TITLE } from "../src/lib/metadata";
import { serve } from "./serve";

const OUT_DIR = path.join(process.cwd(), "out");
const PDF_DIR = path.join(OUT_DIR, "pdfs");

// Chrome renders the header in isolation: it can't load external resources, and it can only use installed fonts.
// The deploy workflow installs GT Eesti Text with scripts/install-fonts.py.
const LOGO = fs.readFileSync(path.join(process.cwd(), "src/app/assets/images/logo-grey.svg")).toString("base64");
const HEADER_TEMPLATE = `
<div style="width: 100%; margin: 0 15mm; display: flex; justify-content: space-between; align-items: center; font-family: 'GT Eesti Text', Helvetica, Arial, sans-serif; font-size: 8pt; color: #000;">
  <div>
    <div style="font-weight: bold;">${SITE_TITLE}</div>
    <div>Open Contracting Partnership 2025. More at: buyingai.open-contracting.org</div>
  </div>
  <img src="data:image/svg+xml;base64,${LOGO}" style="height: 10mm;">
</div>`;

async function main() {
  const slugs = fs
    .readdirSync(path.join(OUT_DIR, "chapter"))
    .filter((slug) => fs.existsSync(path.join(OUT_DIR, "chapter", slug, "print.html")))
    .sort();

  fs.mkdirSync(PDF_DIR, { recursive: true });

  const server = await serve();
  const { port } = server.address() as { port: number };
  const browser = await chromium.launch({ channel: "chrome" });

  try {
    const page = await browser.newPage();
    for (const slug of slugs) {
      await page.goto(`http://127.0.0.1:${port}/chapter/${slug}/print`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({
        path: path.join(PDF_DIR, `${slug}.pdf`),
        format: "Letter",
        printBackground: true,
        // Lays out the page wider than Tailwind's md breakpoint (768px), as on desktop.
        scale: 0.85,
        margin: { top: "30mm", right: "15mm", bottom: "15mm", left: "15mm" },
        displayHeaderFooter: true,
        headerTemplate: HEADER_TEMPLATE,
        footerTemplate: "<span></span>",
      });
      console.log(`✓ pdfs/${slug}.pdf`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
