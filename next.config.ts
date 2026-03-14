import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lichess1.org',
      },
      {
        protocol: 'https',
        hostname: 'lichess.org',
      },
    ],
  },
};

export default nextConfig;
