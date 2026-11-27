import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDXHx02vaNn-IXEAPRdOtSnErw2Zyug9i4",
  authDomain: "lost-and-found-af510.firebaseapp.com",
  projectId: "lost-and-found-af510",
  storageBucket: "lost-and-found-af510.firebasestorage.app",
  messagingSenderId: "820171904206",
  appId: "1:820171904206:web:cbc590673634040fb9ec9f",
  measurementId: "G-1172S3WWLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);