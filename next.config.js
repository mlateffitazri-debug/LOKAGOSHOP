/** @type {import('next').NextConfig} */

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co'

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      // Default: self only
      `default-src 'self'`,
      // Scripts: self + inline scripts needed by Next.js (nonce not feasible with App Router SSG)
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com`,
      // Styles: self + inline styles (used extensively in prototype pages)
      // unpkg.com needed for leaflet.css — without it the map tiles render
      // unpositioned (diagonal/grey map view)
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com`,
      // Fonts
      `font-src 'self' https://fonts.gstatic.com`,
      // Images: self + Supabase storage + Google profile pics + data URIs
      `img-src 'self' data: blob: https://${supabaseHost} https://lh3.googleusercontent.com https://*.tile.openstreetmap.org`,
      // Connections: self + Supabase API + WhatsApp (for wa.me links)
      `connect-src 'self' https://${supabaseHost} https://wa.me wss://${supabaseHost}`,
      // Frames: block all
      `frame-src 'none'`,
      // Objects: block all
      `object-src 'none'`,
      // Base URI: self only (prevent base tag injection)
      `base-uri 'self'`,
      // Form actions: self only
      `form-action 'self'`,
      // Upgrade insecure requests in production
      ...(process.env.NODE_ENV === 'production' ? [`upgrade-insecure-requests`] : []),
    ].join('; '),
  },
]

const nextConfig = {
  // Prevent webpack from bundling native modules — they must be require()'d at runtime
  serverExternalPackages: ['sharp'],
  experimental: {
    // Force-include libvips .so files in the OG route's serverless function bundle.
    // Without this, Vercel's file tracer omits the shared libraries that sharp needs.
    outputFileTracingIncludes: {
      '/api/og/**': [
        './node_modules/@img/sharp-linux-x64/**/*',
        './node_modules/@img/sharp-libvips-linux-x64/**/*',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: supabaseHost,
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
