import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    // The (site) and (print) route groups have separate root layouts. See src/app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
