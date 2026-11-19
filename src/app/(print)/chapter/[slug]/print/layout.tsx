import type { Metadata } from "next";
import { ReactNode } from "react";
import { IBM_Plex_Sans, Open_Sans } from "next/font/google";
import "@/app/globals.css";
import { GlossaryProvider } from "@/components/GlossaryProvider";
import { RegionProvider } from "@/components/RegionProvider";
import glossaryData from "@/app/data/glossary.json";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

// GT Eesti isn't licensed for embedding in the PDFs generated from this page.
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "BuyingAI: Tips and tools for public procurement",
};

export default function PrintLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${openSans.variable} open-sans-only antialiased min-h-screen !bg-white text-black font-gteesti-text overflow-x-hidden`}
        style={{ display: 'block', visibility: 'visible', opacity: 1 }}
      >
        <RegionProvider autoProcess={false}>
          <GlossaryProvider glossaryData={glossaryData} autoProcess={false}>
            <div style={{ display: 'block', visibility: 'visible', opacity: 1, minHeight: '100vh' }}>
              {children}
            </div>
          </GlossaryProvider>
        </RegionProvider>
      </body>
    </html>
  );
}

