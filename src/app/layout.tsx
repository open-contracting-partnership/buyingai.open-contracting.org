import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";
import Footer from "@/components/Footer";
import { getAllChapters } from "@/lib/markdown";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ocp-ai-buying.netlify.app";

export const metadata: Metadata = {
  title:
    "Open Contracting Partnership: open, fair & efficient public contracting",
  description:
    "We connect governments, civil society and business to open up and monitor public procurement. Open contracting results in fairer deals and less corruption.",
  openGraph: {
    title:
      "Open Contracting Partnership: open, fair & efficient public contracting",
    description:
      "We connect governments, civil society and business to open up and monitor public procurement. Open contracting results in fairer deals and less corruption.",
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
    title:
      "Open Contracting Partnership: open, fair & efficient public contracting",
    description:
      "We connect governments, civil society and business to open up and monitor public procurement. Open contracting results in fairer deals and less corruption.",
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
        className={`${ibmPlexSans.variable} antialiased min-h-screen !bg-[#3D393D] text-white font-gteesti-text overflow-x-hidden`}
      >
        <GoogleAnalytics gaId="G-ST56FGCHR2" />
        <Header chapters={chapters} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
