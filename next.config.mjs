/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg'],
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uerbqswgxsinayfyntsm.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8081',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', '@base-ui/react'],
    serverActions: {
      bodySizeLimit: '300mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/custom-creation',
        destination: '/contact',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8081/api'}/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8081/api'}/uploads/:path*`,
      },
      {
        source: '/storage/v1/:path*',
        destination: 'https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/:path*',
      },
    ]
  },
}

export default nextConfig

