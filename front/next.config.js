/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Next.js 15.x to allow cross-origin requests for /_next/* resources during development
  // when accessing the dev server via a different host (e.g., through Nginx proxy)
  allowedDevOrigins: ['https://10.49.12.46:9943'],

  experimental: {
    serverActions: {
      // This attempts to tell Next.js to trust the X-Forwarded-Host header
      // as sent by your Nginx proxy.
      // We list the host value that Nginx is sending.
      allowedForwardedHosts: ['10.49.12.46:9943'],
      // It might also be necessary to specify allowedOrigins if the above isn't enough.
      allowedOrigins: ['https://10.49.12.46:9943'] // The full origin including scheme and port
    },
  },
};

module.exports = nextConfig;
