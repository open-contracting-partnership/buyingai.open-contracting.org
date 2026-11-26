import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import "@/app/globals.css";
import glossaryData from "@/app/data/glossary.json";
import Footer from "@/components/Footer";
import { GlossaryProvider } from "@/components/GlossaryProvider";
import { RegionProvider } from "@/components/RegionProvider";
import { SITE_URL } from "@/lib/links";
import { getAllChapters } from "@/lib/markdown";
import { OG_IMAGE, OPEN_GRAPH, SITE_TITLE } from "@/lib/metadata";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

const title = SITE_TITLE;
const description =
  "This guide by Open Contracting Partnership offers practical guidance and hands-on tips to get the best results from your AI purchases.";

// Next.js fills in the Twitter card's title, description and image from openGraph.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    ...OPEN_GRAPH,
    title,
    description,
    url: SITE_URL,
    images: [{ ...OG_IMAGE, alt: "Open Contracting Partnership" }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get chapters at build time
  const chapters = getAllChapters();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} antialiased min-h-screen !bg-[#F2F3F4] text-black font-gteesti-text overflow-x-hidden`}
      >
        <RegionProvider>
          <GlossaryProvider glossaryData={glossaryData}>
            <GoogleAnalytics gaId="G-ST56FGCHR2" />
            <Script id="google-ads-conversion" strategy="afterInteractive">
              {`gtag('event', 'conversion', {'send_to': 'AW-11089237594/4yOlCPGbz5EYENqs4acp'});`}
            </Script>
            <Header chapters={chapters} />
            <main>{children}</main>
            <Footer />
          </GlossaryProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
