import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  // Transpile ESM-only LangChain/Langfuse packages so Next.js can bundle them
  transpilePackages: [
    'langfuse',
    '@langchain/langgraph',
    '@langchain/langgraph-checkpoint',
    '@langchain/langgraph-checkpoint-sqlite',
    '@langchain/anthropic',
    '@langchain/core',
  ],
  // Keep native/binary packages out of the bundle — Node.js requires them directly
  serverExternalPackages: ['simple-git', 'ts-morph', 'better-sqlite3'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};


export default nextConfig;
