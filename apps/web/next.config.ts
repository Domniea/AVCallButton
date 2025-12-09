import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@av/ui"],
    experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
