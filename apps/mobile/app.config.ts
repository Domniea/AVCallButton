import { ExpoConfig, ConfigContext } from "expo/config";

export default function ({ config }: ConfigContext): ExpoConfig {
  const isProd = process.env.APP_ENV === "production";

  return {
    ...config,

    name: isProd ? "AV Call Button" : "AV Call Button (Dev)",

    slug: "avcallbutton",
    scheme: "avcallbutton",

    version: "1.0.0",
    orientation: "portrait",

    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    plugins: [
      [
        "expo-notifications",
        {
          color: "#ffffff",
        },
      ],
    ],

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      bundleIdentifier: "com.domniea.avcallbutton",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      package: "com.domniea.avcallbutton",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      favicon: "./assets/favicon.png",
    },

    extra: {
      APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId:
          process.env.EXPO_PUBLIC_PROJECT_ID ??
          "e9508cb9-cf8f-4576-b40b-4c7ade333434",
      },
    },
  };
}
