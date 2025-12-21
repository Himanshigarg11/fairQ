import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBr8i4w4iiGH2gtQ50I2n4cVPu9ZaIR-ng",
  authDomain: "fairq-fb284.firebaseapp.com",
  projectId: "fairq-fb284",
  storageBucket: "fairq-fb284.firebasestorage.app",
  messagingSenderId: "977159171584",
  appId: "1:977159171584:web:afeb26bb1759b3343ab2e5",
  measurementId: "G-2KMH0HXCQ3"
};


const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
