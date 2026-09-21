import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
  poweredByHeader: false,
  turbopack: { root: __dirname },
};

export default nextConfig;
