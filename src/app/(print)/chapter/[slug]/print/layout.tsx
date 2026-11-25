import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { SITE_TITLE } from "@/lib/metadata";

export const metadata: Metadata = {
  title: SITE_TITLE,
};

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen !bg-white text-black font-gteesti-text overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
