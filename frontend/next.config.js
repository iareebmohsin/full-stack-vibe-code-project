/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // Suppress hydration warnings caused by browser extensions (e.g., Grammarly)
  reactStrictMode: true,

  // Suppress hydration warnings in development for browser extensions
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Image configuration for SVG support
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optional: Add custom webpack config to suppress specific warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Suppress hydration warnings in development
      config.ignoreWarnings = [
        { module: /node_modules/ },
        // Suppress specific hydration warnings from browser extensions
        /Warning: Extra attributes from the server/,
        /Warning: Text content did not match/,
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
