import fs from "fs";
import http from "http";
import path from "path";
import { chromium } from "playwright-core";

const OUT_DIR = path.join(process.cwd(), "out");
const PDF_DIR = path.join(OUT_DIR, "pdfs");

// Chrome renders the header in isolation: it can't load external resources, and it can only use installed fonts.
// The deploy workflow installs GT Eesti Text with scripts/install-fonts.py.
const LOGO = fs.readFileSync(path.join(process.cwd(), "src/app/assets/images/logo-grey.svg")).toString("base64");
const HEADER_TEMPLATE = `
<div style="width: 100%; margin: 0 15mm; display: flex; justify-content: space-between; align-items: center; font-family: 'GT Eesti Text', Helvetica, Arial, sans-serif; font-size: 8pt; color: #000;">
  <div>
    <div style="font-weight: bold;">BuyingAI: Tips and tools for public procurement</div>
    <div>Open Contracting Partnership 2025. More at: buyingai.open-contracting.org</div>
  </div>
  <img src="data:image/svg+xml;base64,${LOGO}" style="height: 10mm;">
</div>`;

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".json": "application/json",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

// Resolve URLs the way Cloudflare Pages does: "/a/b" serves "a/b", "a/b.html" or "a/b/index.html".
function resolveFile(urlPath: string): string | undefined {
  const base = path.join(OUT_DIR, decodeURIComponent(urlPath));
  if (!base.startsWith(OUT_DIR)) {
    return undefined;
  }
  return [base, `${base}.html`, path.join(base, "index.html")].find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
}

function serve(): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const file = resolveFile(new URL(req.url ?? "/", "http://localhost").pathname);
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

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
