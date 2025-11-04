"use client";

import Link from "next/link";

import { BannerCarousel } from "@/components/BannerCarousel";
import { Chapter } from "@/lib/markdown";
import { SectionsStructure } from "@/lib/sections-types";

interface HomeClientProps {
  chapters: Chapter[];
  structure: SectionsStructure;
}

export default function HomeClient({ chapters, structure }: HomeClientProps) {
  return (
    <>
      {/* Hero Section */}
      <div className="relative w-11/12 mx-auto max-w-7xl py-12 md:py-24">
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
      <div className="w-11/12 ml-auto max-w-[1000px]">
        <div
          className="
              rounded-b-[10px]
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
            This guidance offers practical and hands-on tips to get the best
            results from your AI purchases.
          </h2>
          <ul className="lg:mt-12 mt-8 space-y-6 lg:space-y-8 text-xl lg:text-2xl">
            <li>
              Developed with public sector procurement, project, and technology
              teams, it builds on the insights of over 50 public sector
              practitioners and experts.
            </li>
            <li>
              The guidance is designed to help you no matter where you are on
              your AI procurement journey. Each piece of content can stand
              alone. You are welcome to review this guidance from top to bottom,
              or jump around. We provide actionable, plain-language information
              to help you get started with what’s essential when buying AI.
            </li>
            <li>
              We hope this resource will help you filter out what you really
              need to know from the noise and provide procurement, project, and
              technology teams with a shared language and vision for working
              together!
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
