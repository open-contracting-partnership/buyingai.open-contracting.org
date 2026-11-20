import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";
import { getAllChapters } from "@/lib/markdown";

export const dynamic = "force-static";

// The home page and the TOC's chapters. The print pages are sources for the PDFs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    ...getAllChapters().map((chapter) => ({ url: `${SITE_URL}/chapter/${chapter.slug}` })),
  ];
}
