import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBjuFg8pE1jJiCsi1TrNBihwr2carkW2Q",
  authDomain: "dazzling-respect-7n50x.firebaseapp.com",
  projectId: "dazzling-respect-7n50x",
  storageBucket: "dazzling-respect-7n50x.firebasestorage.app",
  messagingSenderId: "465029572558",
  appId: "1:465029572558:web:1157b7f82fc48ed30aed9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with long-polling to prevent proxy/iframe connection blockages
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-bfchicboutiqueap-7dd7a2d5-60ad-4395-86a1-ce83fb5bc0b1");

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

