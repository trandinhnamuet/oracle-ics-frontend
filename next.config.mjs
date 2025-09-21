/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Tự động sử dụng PORT từ .env
  experimental: {
    serverComponentsExternalPackages: [],
  },
  env: {
    PORT: process.env.PORT || '3000',
  },
}

export default nextConfig
