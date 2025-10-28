import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";
import Footer from "@/components/Footer";
import { getAllChapters } from "@/lib/markdown";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Open Contracting Partnership: open, fair & efficient public contracting",
  description:
    "We connect governments, civil society and business to open up and monitor public procurement. Open contracting results in fairer deals and less corruption.",
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
        <Header chapters={chapters} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
