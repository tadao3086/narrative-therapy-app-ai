import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // basePath: '/narrative-therapy-ai', // URL確定時に後で設定
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
