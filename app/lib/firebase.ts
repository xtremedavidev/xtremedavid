import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCHv-45SOLbocZS7erpau422QpGblZqTPc",
  authDomain: "xtreme-david.firebaseapp.com",
  projectId: "xtreme-david",
  storageBucket: "xtreme-david.firebasestorage.app",
  messagingSenderId: "466075591019",
  appId: "1:466075591019:web:4c432029bb1b283e2eac2e",
  measurementId: "G-B3KD5PK4LE",
};

// Initialize Firebase (safely handle Next.js hot-reloads)
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export let analytics: Analytics | null = null;

// Analytics is only supported in browser environments
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
