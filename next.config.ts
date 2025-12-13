import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Explicitly set Turbopack root to this project to avoid workspace root inference issues on Windows
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  // This prevents Next from accidentally selecting a lockfile in a parent folder as the workspace root.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Expose feature flags to the client-side
  env: {
    ENABLE_ATTACHMENTS: process.env.ENABLE_ATTACHMENTS || 'false',
  },
};

export default nextConfig;
