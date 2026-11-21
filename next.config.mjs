const cdnHost = process.env.NEXT_PUBLIC_CDN_URL ? ` ${process.env.NEXT_PUBLIC_CDN_URL}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true, // Enables Gzip & Brotli compression on server responses
  output: 'standalone',
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || undefined,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        // Immutable static assets (JS chunks, CSS files, media with content hashes)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Optimized images cache
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'${cdnHost}; script-src 'self' 'unsafe-eval' 'unsafe-inline'${cdnHost}; style-src 'self' 'unsafe-inline' fonts.googleapis.com${cdnHost}; font-src 'self' fonts.gstatic.com${cdnHost}; img-src 'self' data: blob: https: http://127.0.0.1:* http://localhost:*${cdnHost}; connect-src 'self' https://*.supabase.co http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*${cdnHost}; frame-src 'self' blob: data:; object-src 'self' blob: data:; base-uri 'self'; form-action 'self'; frame-ancestors 'self';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
