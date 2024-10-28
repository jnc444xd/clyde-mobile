import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Use dotenv later
const firebaseConfig = {
    apiKey: "AIzaSyC2mVrLlM1bBc5lv4ql_zTy3DLRjJWIF_w",
    authDomain: "clyde-mobile-72592.firebaseapp.com",
    projectId: "clyde-mobile-72592",
    storageBucket: "clyde-mobile-72592.appspot.com",
    messagingSenderId: "789980812214",
    appId: "1:789980812214:web:d5b7b6472478d57118a717"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };