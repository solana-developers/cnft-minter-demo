/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  swcMinify: true,
  // webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };

    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};
