import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate critical config
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.authDomain && !!firebaseConfig.projectId;

let app: FirebaseApp;

try {
  if (getApps().length === 0) {
    if (isConfigValid) {
        app = initializeApp(firebaseConfig);
    } else {
        console.warn("Firebase config missing. Initializing with empty config to prevent crash, but Auth will fail.");
        // Initialize with empty config to allow app to load (albeit broken)
        app = initializeApp({}); 
    }
  } else {
    app = getApps()[0];
  }
} catch (error) {
    console.error("Firebase initialization error:", error);
    // If initialization fails, we might crash hard later, but let's try to proceed
    throw error;
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);