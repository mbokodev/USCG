import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Turbopack configuration for monorepo workspace
  turbopack: {
    root: "..",
  },
  typescript: {
    // Désactiver les erreurs TypeScript pendant le build
    // On les corrigera progressivement
    ignoreBuildErrors: true,
  },
  images: {
    // Disable optimization for localhost in development (private IP blocking)
    unoptimized: process.env.NODE_ENV === "development",
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
