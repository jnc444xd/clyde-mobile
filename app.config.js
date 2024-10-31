import 'dotenv/config';

export default () => {
  return {
    expo: {
      owner: "jnc444xd",
      slug: "clyde-ave",
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
      }
    }
  };
};