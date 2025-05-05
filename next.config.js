/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["8ybl2ah7tkcii6tt.public.blob.vercel-storage.com", "hebbkx1anhila5yf.public.blob.vercel-storage.com"],
    unoptimized: true,
  },
}

module.exports = nextConfig
