const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration for React Native monorepo (pnpm + Turbo)
 * Compatible with RN 0.82+, EAS, Firebase, and symlinks.
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// Load default Metro config for this workspace
const defaultConfig = getDefaultConfig(projectRoot);

module.exports = mergeConfig(defaultConfig, {
  watchFolders: [
    workspaceRoot // Allow Metro to watch files in the root of the monorepo
  ],

  resolver: {
    // Ensure Metro resolves modules from both mobile and root node_modules
    nodeModulesPaths: [
      path.join(projectRoot, "node_modules"),
      path.join(workspaceRoot, "node_modules")
    ],

    // 👇 Required for pnpm + Turbo
    unstable_enableSymlinks: true,

    // Prevent Metro from trying to load the web project's node_modules
    blockList: [
      /apps\/web\/node_modules\/.*/
    ],

    // Support extension resolution
    sourceExts: defaultConfig.resolver.sourceExts
  },

  transformer: {
    // Required for React Native 0.82 Hermes + Reanimated
    babelTransformerPath: require.resolve("react-native-svg-transformer")
  }
});



// const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
// const path = require("path");

// module.exports = mergeConfig(
//   getDefaultConfig(__dirname),
//   {
//     resolver: {
//       unstable_enableSymlinks: true,
//       unstable_enablePackageExports: true,
//       extraNodeModules: {
//         // Force React & React Native to the hoisted package
//         "react": path.resolve(__dirname, "../../node_modules/react"),
//         "react-native": path.resolve(__dirname, "../../node_modules/react-native"),
//       }
//     }
//   }
// );