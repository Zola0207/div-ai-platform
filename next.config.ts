import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Isključeno: javne strane /s/[slug] moraju da vraćaju pravi 404 i da se
  // renderuju po zahtevu, što cacheComponents blokira.
  cacheComponents: false,
  // Font se čita sa diska u rutama za OG slike, pa ga eksplicitno
  // uključujemo u serverless bundle.
  outputFileTracingIncludes: {
    '/s/[slug]/opengraph-image': ['./assets/Geist-Regular.ttf'],
    '/opengraph-image': ['./assets/Geist-Regular.ttf'],
  },
};

export default nextConfig;
