"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { BannerCarousel } from "@/components/BannerCarousel";
import { Chapter } from "@/lib/markdown";
import { SectionsStructure } from "@/lib/sections-types";

import arrowLeft from "@/app/assets/images/arrow-left.svg";
import Image from "next/image";

interface HomeClientProps {
  chapters: Chapter[];
  structure: SectionsStructure;
  tocContent: string;
}

export default function HomeClient({
  chapters,
  structure,
  tocContent,
}: HomeClientProps) {
  // Parse the TOC content - extract content after the numbered list
  // Skip everything before the ## heading
  const contentMatch = tocContent.match(
    /##\s+(.+?)\n([\s\S]*?)(\[Get started.*?\])/
  );
  const heading = contentMatch
    ? contentMatch[1].trim()
    : "This guidance offers practical and hands-on tips to get the best results from your AI purchases.";
  const bodyContent = contentMatch ? contentMatch[2].trim() : "";

  // Split body content into paragraphs (separated by blank lines)
  const paragraphs = bodyContent.split(/\n\s*\n/).filter((p) => p.trim());

  // Extract the About section
  const aboutMatch = tocContent.match(/###\s+About\s*([\s\S]+)/);
  const aboutContent = aboutMatch ? aboutMatch[1].trim() : "";
  return (
    <>
      {/* Hero Section */}
      <div className="relative w-11/12 mx-auto max-w-7xl py-12 md:py-24 z-0">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Title - 1/3 of space */}
          <div className="w-full lg:w-[33.33%]">
            <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-[#C8D419] to-[#23B2A7] bg-clip-text text-transparent leading-tight font-gteesti-display">
              Buying AI
            </h1>
            <p className="mt-2 text-2xl lg:text-3xl xl:text-4xl text-black font-gteesti-pro-display font-bold">
              Tips and tools for public <br /> procurement
            </p>
          </div>

          {/* Right: Section Cards - 2/3 of space */}
          <div className="w-full lg:w-[66.66%]">
            <BannerCarousel structure={structure} />
          </div>
        </div>
      </div>
      <div className="w-11/12 mx-auto lg:ml-auto max-w-[1000px] lg:mr-[68px]">
        <div
          className="
              rounded-[10px]
              bg-[linear-gradient(91deg,_#FFF_0.16%,_rgba(255,255,255,0.70)_100%)]
              shadow-[0_10px_40px_0_rgba(0,0,0,0.10)]
              backdrop-blur-[15px]
              lg:pt-28
              lg:pl-20
              lg:pr-28
              lg:pb-36
              p-8
            "
        >
          <h2 className="text-[#353535] text-3xl lg:text-4xl xl:text-5xl font-bold font-gteesti-display">
            {heading}
          </h2>
          <div className="lg:mt-12 mt-8 !space-y-6 lg:!space-y-8 text-xl lg:text-2xl prose prose-xl max-w-none prose-p:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {paragraphs.join("\n\n")}
            </ReactMarkdown>
          </div>
          <Link
            href="/chapter/01-insights-on-ai-adoption#content"
            className="inline-flex mt-8 py-2 pl-3 pr-8 gap-x-2.5 bg-[#AFCB4E] text-black rounded hover:bg-[#AFCB4E] transition-colors text-lg lg:text-xl uppercase font-bold font-gteesti-pro-display"
          >
            <Image
              src={arrowLeft}
              alt="Arrow left"
              width={28.2}
              height={28.2}
            />
            <span>Get started</span>
          </Link>
        </div>
      </div>
    </>
  );
}
