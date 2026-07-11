import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL
  },

  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true
    };

    // Paper.js bundles a Node.js canvas adapter that requires jsdom.
    // jsdom is not available in the Vercel/webpack build environment.
    // Solution: externalize 'paper' on the server so it is never bundled SSR.
    // Client-side, the dynamic import with ssr:false already prevents SSR execution.
    if (isServer) {
      const existingExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(existingExternals) ? existingExternals : [existingExternals]),
        'paper',
      ];
    }

    // Prevent canvas/jsdom from breaking the client bundle too
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      jsdom: false,
    };

    return config;
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  transpilePackages: ['lucide-react', 'recharts', '@chakra-ui/react', '@emotion/react', '@emotion/styled', '@zag-js/react'],

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'placeholder.pics'],
  },
  async rewrites() {
    return [
      {
        source: '/debug/:path*',
        destination: 'http://localhost:8000/debug/:path*',
      },
      {
        source: '/analytics/:path*',
        destination: 'http://localhost:8000/analytics/:path*',
      },
      {
        source: '/error',
        destination: 'http://localhost:8000/error',
      },
      {
        source: '/ping',
        destination: 'http://localhost:8000/ping',
      },
    ]
  },
};

export default withNextIntl(nextConfig);
