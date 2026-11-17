const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MARKER = "Xcode 27 requires deployment targets >= 15.0";

const SNIPPET = `
    # ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || current.to_f < 15.0
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end
`;

/**
 * Xcode 27 rejects CocoaPods resource targets below iOS 15.
 * Keep this patch in the generated Podfile across prebuilds.
 */
function withXcode27PodDeploymentTarget(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf8");
      if (contents.includes(MARKER)) {
        return cfg;
      }

      const needle = "ccache_enabled?(podfile_properties),\n    )";
      if (!contents.includes(needle)) {
        throw new Error(
          "withXcode27PodDeploymentTarget: unexpected Podfile shape; update the plugin."
        );
      }

      contents = contents.replace(
        needle,
        `ccache_enabled?(podfile_properties),\n    )\n${SNIPPET}`
      );
      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withXcode27PodDeploymentTarget;
