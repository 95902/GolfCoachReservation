import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Réactiver la validation
  },
  reactStrictMode: true, // Réactiver le mode strict
  webpack: (config, { dev }) => {
    // Configuration webpack normale
    return config;
  },
  eslint: {
    ignoreDuringBuilds: false, // Réactiver ESLint
  },
};

export default nextConfig;
