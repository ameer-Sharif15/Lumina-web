import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy Firebase Auth handler through our domain so mobile browsers
        // don't block cross-site storage during the signInWithRedirect flow.
        source: '/__/auth/:path*',
        destination: 'https://luminaai-1a068.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
