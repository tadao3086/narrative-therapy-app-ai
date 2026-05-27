import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/narrative-therapy-app-ai', // リポジトリ名に合わせて設定
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
