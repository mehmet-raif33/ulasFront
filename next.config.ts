import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SERVER_API: process.env.SERVER_API,
    NEXT_PUBLIC_SERVER_API1: process.env.SERVER_API1,
    NEXT_PUBLIC_FRONTEND_URL: process.env.FRONTEND_URL,
  },

  // Webpack configuration for production builds
  webpack: (config, { dev, isServer }) => {
    // Remove console.logs in production builds
    if (!dev && !isServer) {
      config.optimization.minimizer.forEach((minimizer: any) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions = {
            ...minimizer.options.terserOptions,
            compress: {
              ...minimizer.options.terserOptions.compress,
              drop_console: true,
              drop_debugger: true,
            },
          };
        }
      });
    }
    return config;
  },
  
  // Vercel deployment optimizasyonları
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for auth
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: '/auth/callback',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
