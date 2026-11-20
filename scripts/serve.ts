import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "out");

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".otf": "font/otf",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
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

// Serve the static export in out/, on the given port (0 for any free port).
export function serve(port = 0): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const file = resolveFile(new URL(req.url ?? "/", "http://localhost").pathname);
    const notFound = path.join(OUT_DIR, "404.html");
    if (!file && !fs.existsSync(notFound)) {
      res.writeHead(404).end();
      return;
    }
    const servedFile = file ?? notFound;
    res.writeHead(file ? 200 : 404, {
      "Content-Type": CONTENT_TYPES[path.extname(servedFile)] ?? "application/octet-stream",
    });
    fs.createReadStream(servedFile).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// Usage: tsx scripts/serve.ts [port]
if (process.argv[1]?.endsWith("serve.ts")) {
  const port = Number(process.argv[2] ?? 8000);
  serve(port).then(() => console.log(`Serving out/ at http://127.0.0.1:${port}`));
}
