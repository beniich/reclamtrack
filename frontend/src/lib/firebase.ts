// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLBChkVivr4uNNl4RlvBk4m0RUX_wLovw",
  authDomain: "reclamtruck.firebaseapp.com",
  projectId: "reclamtruck",
  storageBucket: "reclamtruck.firebasestorage.app",
  messagingSenderId: "437273270346",
  appId: "1:437273270346:web:830358824b3c600b0faeb3",
  measurementId: "G-N7CLQYSPJ8"
};

// Initialize Firebase (prevent multiple initializations in dev mode)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Only initialize analytics on the client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
