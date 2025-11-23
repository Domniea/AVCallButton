const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Make Metro watch the monorepo root
config.watchFolders = [workspaceRoot];

// 2. Ensure Metro finds node_modules in both places
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. REQUIRED for PNPM/Yarn workspaces to work in RN
config.resolver.unstable_enableSymlinks = true;

// 4. Your custom .native.ts priority
config.resolver.sourceExts = [
  "native.ts",
  "native.tsx",
  "native.js",
  "native.jsx",
  ...config.resolver.sourceExts,
];

module.exports = config;
