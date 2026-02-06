import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";
import Footer from "@/components/Footer";
import { getAllChapters } from "@/lib/markdown";
import { GlossaryProvider } from "@/components/GlossaryProvider";
import { RegionProvider } from "@/components/RegionProvider";
import glossaryData from "@/app/data/glossary.json";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ocp-ai-buying.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BuyingAI: Tools and tips for public procurement",
  description:
    "This guide by Open Contracting Partnership offers practical guidance and hands-on tips to get the best results from your AI purchases.",
  openGraph: {
    title: "BuyingAI: Tools and tips for public procurement",
    description:
      "This guide by Open Contracting Partnership offers practical guidance and hands-on tips to get the best results from your AI purchases.",
    url: siteUrl,
    siteName: "Open Contracting Partnership",
    images: [
      {
        url: "/images/og-image.png", // Ruta de la imagen OG - coloca tu imagen en public/og-image.png
        width: 1200,
        height: 630,
        alt: "Open Contracting Partnership",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyingAI: Tools and tips for public procurement",
    description:
      "This guide by Open Contracting Partnership offers practical guidance and hands-on tips to get the best results from your AI purchases.",
    images: ["/images/og-image.png"], // Ruta de la imagen OG - coloca tu imagen en public/og-image.png
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get chapters at build time
  const chapters = getAllChapters().filter((ch) => ch.slug !== "00-toc");

  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} antialiased min-h-screen !bg-[#F2F3F4] text-black font-gteesti-text overflow-x-hidden`}
      >
        <RegionProvider autoProcess={true}>
          <GlossaryProvider glossaryData={glossaryData} autoProcess={true}>
            <GoogleAnalytics gaId="G-ST56FGCHR2" />
            <Script
              id="google-ads-conversion"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  gtag('event', 'conversion', {'send_to': 'AW-11089237594/4yOlCPGbz5EYENqs4acp'});
                `,
              }}
            />
            <Header chapters={chapters} />
            <main>{children}</main>
            <Footer />
          </GlossaryProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
