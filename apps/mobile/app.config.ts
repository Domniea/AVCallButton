import "dotenv/config";

export default () => {
  const isDev = process.env.APP_ENV === "development";

  return {
    name: isDev ? "AVCallButton (Dev)" : "AVCallButton",
    slug: "mobile",
    version: "1.0.0",

    extra: {
      appEnv: process.env.APP_ENV,
      firebaseEnv: process.env.FIREBASE_ENV,

      firebase: {
        apiKey: isDev ? process.env.FIREBASE_API_KEY_DEV : process.env.FIREBASE_API_KEY_PROD,
        authDomain: isDev ? process.env.FIREBASE_AUTH_DOMAIN_DEV : process.env.FIREBASE_AUTH_DOMAIN_PROD,
        projectId: isDev ? process.env.FIREBASE_PROJECT_ID_DEV : process.env.FIREBASE_PROJECT_ID_PROD,
        storageBucket: isDev ? process.env.FIREBASE_STORAGE_BUCKET_DEV : process.env.FIREBASE_STORAGE_BUCKET_PROD,
        messagingSenderId: isDev
          ? process.env.FIREBASE_MESSAGING_SENDER_ID_DEV
          : process.env.FIREBASE_MESSAGING_SENDER_ID_PROD,
        appId: isDev ? process.env.FIREBASE_APP_ID_DEV : process.env.FIREBASE_APP_ID_PROD,
        measurementId: isDev
          ? process.env.FIREBASE_MEASUREMENT_ID_DEV
          : process.env.FIREBASE_MEASUREMENT_ID_PROD
      }
    }
  };
};
