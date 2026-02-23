import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredBy: false,
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
