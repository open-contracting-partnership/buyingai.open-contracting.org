import HomeClient from "@/components/Home/HomeClient";
import { getAllChapters, getChapterBySlug } from "@/lib/markdown";
import { getSectionsStructure } from "@/lib/sections";

export default function Home() {
  const chapters = getAllChapters().filter((ch) => ch.slug !== "00-toc");
  const structure = getSectionsStructure();
  const tocChapter = getChapterBySlug("00-toc");
  const tocContent = tocChapter?.content || "";
  
  return <HomeClient chapters={chapters} structure={structure} tocContent={tocContent} />;
}
