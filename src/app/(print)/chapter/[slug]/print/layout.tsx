import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "BuyingAI: Tips and tools for public procurement",
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
