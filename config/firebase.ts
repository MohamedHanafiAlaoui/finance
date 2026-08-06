import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBYCmInCYjc1Rbdx8q_9sDJEH22scWWg9I",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "griffin-frank.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "griffin-frank",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "griffin-frank.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "632675699833",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "1:632675699833:web:a580dbc09c7fbe585698a8",
};

// Ensure app is initialized only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth — guard against double-initialization (e.g. hot reloads)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Auth was already initialized, just retrieve it
  auth = getAuth(app);
}

const firestore = getFirestore(app);

export { auth, firestore };
export default app;
