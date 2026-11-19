import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import glossaryData from "@/app/data/glossary.json";
import { GlossaryProvider } from "@/components/GlossaryProvider";
import { RegionProvider } from "@/components/RegionProvider";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuyingAI: Tips and tools for public procurement",
};

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} antialiased min-h-screen !bg-white text-black font-gteesti-text overflow-x-hidden`}
        style={{ display: "block", visibility: "visible", opacity: 1 }}
      >
        <RegionProvider autoProcess={false}>
          <GlossaryProvider glossaryData={glossaryData} autoProcess={false}>
            <div style={{ display: "block", visibility: "visible", opacity: 1, minHeight: "100vh" }}>{children}</div>
          </GlossaryProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
