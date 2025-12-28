import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 Ye line miss ho gayi thi

// ⚠️ Yahan apni ASLI Firebase Config wapas paste karo ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyBtsj6ZBuhBtoHBwGIi5ymJo6NT_KHA6Xs", // <--- Apni asli key yahan daalo
  authDomain: "lnm-verse.firebaseapp.com",
  projectId: "lnm-verse",
  storageBucket: "lnm-verse.appspot.com",
  messagingSenderId: "..............",
  appId: "......................"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exports
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); // 👈 Ye line 'db' error ko fix karegi

export default app;