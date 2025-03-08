// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiBdIKHJz3dDklyC2PNtHYnp3bsqHta5I",
  authDomain: "aitp-fbf23.firebaseapp.com",
  projectId: "aitp-fbf23",
  storageBucket: "aitp-fbf23.firebasestorage.app",
  messagingSenderId: "541302754824",
  appId: "1:541302754824:web:28b109bf0e103e57718bbd",
  measurementId: "G-Z8GP40B8RW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);