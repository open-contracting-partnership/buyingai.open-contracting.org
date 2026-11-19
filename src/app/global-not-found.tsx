import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found - BuyingAI: Tips and tools for public procurement",
};

// The (site) and (print) route groups have separate root layouts, so the 404 page has its own.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen !bg-[#F2F3F4] text-black font-gteesti-text">
        <main className="w-11/12 max-w-3xl mx-auto py-24">
          <h1 className="text-4xl font-bold font-gteesti-display">Page not found</h1>
          <p className="mt-6 text-lg">The page you're looking for doesn't exist.</p>
          <p className="mt-6 text-lg">
            <Link href="/" className="underline">
              Go to the home page
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
