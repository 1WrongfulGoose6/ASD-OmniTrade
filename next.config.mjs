// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security configurations
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Compression and performance
  compress: true,
  
  // Security headers (backup to middleware)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
    ];
  },

  // Redirects including HTTPS enforcement
  async redirects() {
    return [
      {
        source: "/api/stock/:symbol",
        destination: "/api/marketdata/detail/:symbol",
        permanent: false, // temporary while migrating
      },
    ];
  },

  // Image optimization settings
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables validation
  env: {
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  },
};

export default nextConfig;
