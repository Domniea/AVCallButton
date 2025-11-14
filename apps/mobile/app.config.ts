import { ExpoConfig, ConfigContext } from "@expo/config";

// const variant = process.env.APP_ENV ?? "development";
// const isDev = variant === "development";

// export default ({ config }: ConfigContext): ExpoConfig => ({
//   ...config,

//   name: isDev ? "AVCallButton (Dev)" : "AVCallButton",
//   slug: "mobile",
//   version: "1.0.0",
//   orientation: "portrait",
//   userInterfaceStyle: "light",
//   newArchEnabled: true,

//   icon: "./assets/icon.png",

//   splash: {
//     image: "./assets/splash-icon.png",
//     resizeMode: "contain",
//     backgroundColor: "#ffffff"
//   },

//     ios: {
//     bundleIdentifier: isDev
//         ? "com.domniea.avcallbutton.dev"
//         : "com.domniea.avcallbutton",
//     supportsTablet: true,
//     infoPlist: {
//         ITSAppUsesNonExemptEncryption: false
//         }
//     },

//   android: {
//     package: isDev
//       ? "com.domniea.avcallbutton.dev"
//       : "com.domniea.avcallbutton",
//     googleServicesFile: "./google-services.json",
//     adaptiveIcon: {
//       foregroundImage: "./assets/adaptive-icon.png",
//       backgroundColor: "#ffffff"
//     },
//     edgeToEdgeEnabled: true
//   },

//   web: {
//     favicon: "./assets/favicon.png"
//   },

//   plugins: [
//     "@react-native-firebase/app",
//   ],

//   extra: {
//     eas: {
//       projectId: "b7cd66fa-aadd-43f7-a2fc-04824e60cd46"
//     },
//   firebase: isDev
//   ? {
//       apiKey: process.env.FIREBASE_API_KEY_DEV,
//       authDomain: process.env.FIREBASE_AUTH_DOMAIN_DEV,
//       projectId: process.env.FIREBASE_PROJECT_ID_DEV,
//       storageBucket: process.env.FIREBASE_STORAGE_BUCKET_DEV,
//       messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_DEV,
//       appId: process.env.FIREBASE_APP_ID_DEV,
//       measurementId: process.env.FIREBASE_MEASUREMENT_ID_DEV
//     }
//   : {
//       apiKey: process.env.FIREBASE_API_KEY_PROD,
//       authDomain: process.env.FIREBASE_AUTH_DOMAIN_PROD,
//       projectId: process.env.FIREBASE_PROJECT_ID_PROD,
//       storageBucket: process.env.FIREBASE_STORAGE_BUCKET_PROD,
//       messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_PROD,
//       appId: process.env.FIREBASE_APP_ID_PROD,
//       measurementId: process.env.FIREBASE_MEASUREMENT_ID_PROD
//     }
//   }
// });



export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_ENV ?? "development";
  const isDev = variant === "development";

  return {
    ...config,

    name: isDev ? "AVCallButton (Dev)" : "AVCallButton",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    icon: "./assets/icon.png",

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    ios: {
      bundleIdentifier: isDev
        ? "com.domniea.avcallbutton.dev"
        : "com.domniea.avcallbutton",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
       googleServicesFile: "./GoogleService-Info.plist"
    },

    android: {
      package: isDev
        ? "com.domniea.avcallbutton.dev"
        : "com.domniea.avcallbutton",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },

    updates: {
      url: "https://u.expo.dev/b7cd66fa-aadd-43f7-a2fc-04824e60cd46"
    },

    runtimeVersion: "1.0.0",

    web: {
      favicon: "./assets/favicon.png"
    },

    plugins: ["@react-native-firebase/app"],

    extra: {
      eas: {
        projectId: "b7cd66fa-aadd-43f7-a2fc-04824e60cd46"
      },
      firebase: isDev
        ? {
            apiKey: process.env.FIREBASE_API_KEY_DEV,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN_DEV,
            projectId: process.env.FIREBASE_PROJECT_ID_DEV,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET_DEV,
            messagingSenderId:
              process.env.FIREBASE_MESSAGING_SENDER_ID_DEV,
            appId: process.env.FIREBASE_APP_ID_DEV,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID_DEV
          }
        : {
            apiKey: process.env.FIREBASE_API_KEY_PROD,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN_PROD,
            projectId: process.env.FIREBASE_PROJECT_ID_PROD,
            storageBucket:
              process.env.FIREBASE_STORAGE_BUCKET_PROD,
            messagingSenderId:
              process.env.FIREBASE_MESSAGING_SENDER_ID_PROD,
            appId: process.env.FIREBASE_APP_ID_PROD,
            measurementId:
              process.env.FIREBASE_MEASUREMENT_ID_PROD
          }
    }
  };
};
