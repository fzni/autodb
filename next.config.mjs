/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  experimental: {
    serverComponentsExternalPackages: ['node:sqlite'],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
