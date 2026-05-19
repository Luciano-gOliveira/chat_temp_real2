import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCqEX8FAkBpSc20tYnWcmgXiBe44kuOE7o",
    authDomain: "chat-real-c9847.firebaseapp.com",
    projectId: "chat-real-c9847",
    storageBucket: "chat-real-c9847.firebasestorage.app",
    messagingSenderId: "1005847616986",
    appId: "1:1005847616986:web:c05cec1a2374f7ab1534e3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);