import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

// real api 
const firebaseConfig = {
  apiKey: "AIzaSyBtsj6ZBuhBtoHBwGIi5ymJo6NT_KHA6Xs", 
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
export const db = getFirestore(app); // 👈 for db error fix 


export default app;
