import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYYx2PoDC5E0bLyhbbRDtH347HdXVYIOU",
  authDomain: "criptopay-d5411.firebaseapp.com",
  projectId: "criptopay-d5411",
  storageBucket: "criptopay-d5411.firebasestorage.app",
  messagingSenderId: "82080743520",
  appId: "1:82080743520:web:c29e7ff61a2f03d7424305",
  measurementId: "G-4MXVRR12Q7"
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
