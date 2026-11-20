import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";
import { getAllChapters } from "@/lib/markdown";

export const dynamic = "force-static";

// The home page and chapters. The print pages are sources for the PDFs, and 00-toc is the home page's source.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    ...getAllChapters()
      .filter((chapter) => chapter.slug !== "00-toc")
      .map((chapter) => ({ url: `${SITE_URL}/chapter/${chapter.slug}` })),
  ];
}
