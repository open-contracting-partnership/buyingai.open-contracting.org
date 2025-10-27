"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/logo.svg";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="py-7 border-b border-white/10 sticky top-0 z-50 bg-[#3D393D]">
      <div className="w-11/12 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            <Link href="/">
              <Image src={logo} alt="OCP Logo" width={183.19} height={63} />
            </Link>
          </div>

          {/* desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <Link
              href="/chapter/01-introduction"
              className="px-6 py-2.5 bg-[#C8D419] text-black font-semibold rounded hover:bg-[#B5C115] transition-colors font-ibm-plex-sans"
            >
              Get the playbook
            </Link>
          </div>

          {/* mobile */}
          <div
            className={clsx(
              "md:hidden fixed top-0 size-full h-screen duration-300 z-50",
              {
                "-left-full": !isMenuOpen,
                "left-0": isMenuOpen,
              }
            )}
          >
            <div className="size-full bg-[#3D393D] backdrop-blur-sm relative p-8">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded cursor-pointer"
                onClick={toggleMenu}
              >
                <XIcon className="size-6 text-white" />
              </button>

              {/* Content */}
              <div className="flex flex-col gap-8 mt-16">
                {/* Logo section */}
                <div className="flex items-center gap-4">
                  <Image src={logo} alt="OCP Logo" width={120} height={40} />
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#C8D419] to-[#23B2A7] bg-clip-text text-transparent font-gteesti-display">
                      Buying AI
                    </h2>
                    <p className="text-sm text-white/60 font-gteesti-pro-display">
                      Tips and tools
                    </p>
                  </div>
                </div>

                {/* Search button */}
                <button className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left w-full">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="text-white">Search</span>
                </button>

                {/* Menu button */}
                <button className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left w-full">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span className="text-white">Menu</span>
                </button>

                {/* Quick links */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  <Link
                    href="/"
                    onClick={toggleMenu}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/chapter/01-introduction"
                    onClick={toggleMenu}
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Introduction
                  </Link>
                </div>

                {/* CTA button */}
                <Link
                  href="/chapter/01-introduction"
                  onClick={toggleMenu}
                  className="mt-4 px-6 py-3 bg-[#C8D419] text-black font-semibold rounded-lg hover:bg-[#B5C115] transition-colors text-center"
                >
                  Get the playbook
                </Link>
              </div>
            </div>
          </div>

          {/* hamburger menu */}
          <div className="md:hidden">
            <button
              className="p-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={toggleMenu}
            >
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
