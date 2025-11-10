import { ReactNode } from "react";
import { IBM_Plex_Sans } from "next/font/google";
import "@/app/globals.css";
import { GlossaryProvider } from "@/components/GlossaryProvider";
import { RegionProvider } from "@/components/RegionProvider";
import glossaryData from "@/app/data/glossary.json";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export default function PrintLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} antialiased min-h-screen !bg-white text-black font-gteesti-text overflow-x-hidden`}
      >
        <RegionProvider autoProcess={true}>
          <GlossaryProvider glossaryData={glossaryData} autoProcess={true}>
            {children}
          </GlossaryProvider>
        </RegionProvider>
      </body>
    </html>
  );
}

