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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        protocol: 'https',
        hostname: 'artisanat-aschi-backend.onrender.com',
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
      {
        source: '/projets',
        destination: '/espaces-d-exception',
        permanent: false,
      },
      {
        source: '/projets-cles-en-main',
        destination: '/espaces-d-exception',
        permanent: false,
      },
      {
        source: '/cles-en-main',
        destination: '/espaces-d-exception',
        permanent: false,
      },
      {
        source: '/projets-d-exception',
        destination: '/espaces-d-exception',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    const backendTarget = (process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://artisanat-aschi-backend.onrender.com/api').replace(/\/+$/, '')
    return [
      {
        source: '/backend-api/:path*',
        destination: `${backendTarget}/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${backendTarget}/uploads/:path*`,
      },
      {
        source: '/storage/v1/:path*',
        destination: 'https://uerbqswgxsinayfyntsm.supabase.co/storage/v1/:path*',
      },
    ]
  },
}

export default nextConfig

