// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/api/stock/:symbol",
        destination: "/api/marketdata/detail/:symbol",
        permanent: false, // temporary while migrating
      },
    ];
  },
};

export default nextConfig;
