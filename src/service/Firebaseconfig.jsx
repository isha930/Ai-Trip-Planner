// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXPyDjIJQbjvbgQZljZerR-YVZLQ7vNeI",
  authDomain: "ai-travel-planner-434019.firebaseapp.com",
  projectId: "ai-travel-planner-434019",
  storageBucket: "ai-travel-planner-434019.appspot.com",
  messagingSenderId: "561976228558",
  appId: "1:561976228558:web:62a7ce7d55df740f276e9f",
  measurementId: "G-2G6DBPT5L4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);