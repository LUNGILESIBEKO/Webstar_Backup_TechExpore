// Firebase.js - the ONE place where the app connects to Firebase.
// Every screen imports { auth, db } from here, so the connection is made once.

import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// These identify YOUR Firebase project. They are not secret passwords
// (your Firestore security rules are what protect the data).
const firebaseConfig = {
  apiKey: "AIzaSyBv_ODG3EFOyBHEnwsmGAV-pJD1m9AnkIQ",
  authDomain: "techexplorerapp.firebaseapp.com",
  projectId: "techexplorerapp",
  storageBucket: "techexplorerapp.firebasestorage.app",
  messagingSenderId: "1084270951276",
  appId: "1:1084270951276:web:526c01e58b59941b019149",
  measurementId: "G-9945XZKJG2",
};

// Reuse the app if it already exists (Fast Refresh re-runs this file).
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// AUTH: on phones, keep the user signed in using AsyncStorage.
// On web the browser handles this itself, so plain getAuth() is enough.
export const auth = isFirstInit && Platform.OS !== "web"
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

// FIRESTORE: auto-detect long polling makes the connection work on
// networks/phones where Firestore's default streaming connection is blocked.
export const db = isFirstInit
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  : getFirestore(app);

// NOTE: getAnalytics() was removed. It only works in a web browser and
// crashes/fails in React Native, so it was breaking the Firebase setup.
