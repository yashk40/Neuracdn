import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfhGDfnYpYhk-X3t0lYwvztkH7x0M6Mug",
  authDomain: "neura-cdn.firebaseapp.com",
  projectId: "neura-cdn",
  storageBucket: "neura-cdn.firebasestorage.app",
  messagingSenderId: "328923964200",
  appId: "1:328923964200:web:01699442f00dd64f63e61d",
  measurementId: "G-9YJLDQ00VD"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics;
// Analytics is only supported in browser environments
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, analytics };
