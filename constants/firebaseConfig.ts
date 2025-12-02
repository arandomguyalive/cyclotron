// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyC0yNtC49_bg_IzVorYO6Y3kA0VHLuT0V8",
  authDomain: "cyclotron-758b4.firebaseapp.com",
  projectId: "cyclotron-758b4",
  storageBucket: "cyclotron-758b4.firebasestorage.app",
  messagingSenderId: "948711394316",
  appId: "1:948711394316:web:3981965be6544011a97229",
  measurementId: "G-F3THX5D37P"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };