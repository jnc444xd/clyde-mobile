import 'dotenv/config';

export default () => ({
  expo: {
    owner: "jnc444xd",
    name: "Clyde Ave",
    slug: "clyde-ave",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.triplecrown.clydeave",
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ["remote-notification"]
      }
    },
    android: {
      package: "com.triplecrown.clydeave",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "9b5266a8-337e-4721-bafe-a2bed096f378"
      },
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      }
    },
    plugins: [
      "expo-router",
      "expo-font"
    ],
    scheme: "clydeave"
  }
});