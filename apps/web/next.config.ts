import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@av/ui"],
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // `@av/ui` barrel re-exports the React Native theme; keep it out of web builds.
      "@av/ui$": path.resolve(
        __dirname,
        "../../packages/ui/src/theme.chakra.ts"
      ),
      "react-native$": path.resolve(__dirname, "lib/empty-module.js"),
      "native-base$": path.resolve(__dirname, "lib/empty-module.js"),
    };
    return config;
  },
};

export default nextConfig;
