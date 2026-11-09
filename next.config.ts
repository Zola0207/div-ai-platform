import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Isključeno: javne strane /s/[slug] moraju da vraćaju pravi 404 i da se
  // renderuju po zahtevu, što cacheComponents blokira.
  cacheComponents: false,
};

export default nextConfig;
