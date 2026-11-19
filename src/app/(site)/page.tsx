import HomeClient from "@/components/Home/HomeClient";
import { getChapterBySlug } from "@/lib/markdown";
import { getSectionsStructure } from "@/lib/sections";

export default function Home() {
  const structure = getSectionsStructure();
  const tocChapter = getChapterBySlug("00-toc");
  const tocContent = tocChapter?.content || "";

  return <HomeClient structure={structure} tocContent={tocContent} />;
}
