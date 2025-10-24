import HomeClient from "@/components/Home/HomeClient";
import { getAllChapters } from "@/lib/markdown";
import { getSectionsStructure } from "@/lib/sections";

export default function Home() {
  const chapters = getAllChapters().filter((ch) => ch.slug !== "00-toc");
  const structure = getSectionsStructure();
  return <HomeClient chapters={chapters} structure={structure} />;
}
