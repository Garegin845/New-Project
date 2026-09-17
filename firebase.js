// =========================================================
// ECOFARM CONNECT — FIREBASE SINGLETON
// =========================================================

import { initializeApp, getApps, getApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth, GoogleAuthProvider,
    signInWithPopup, signInWithRedirect, getRedirectResult,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendPasswordResetEmail, updateProfile, signOut,
    onAuthStateChanged, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore, doc, getDoc, setDoc, updateDoc,
    collection, addDoc, getDocs, query, where,
    orderBy, limit, serverTimestamp, FieldValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const firebaseConfig = {
    apiKey: "AIzaSyA6TZvB9PvnsBaivtb4JMbzucGKiAzCSv4",
    authDomain: "ecofarm-connect.firebaseapp.com",
    projectId: "ecofarm-connect",
    storageBucket: "ecofarm-connect.firebasestorage.app",
    messagingSenderId: "231887548228",
    appId: "1:231887548228:web:430446e1c16c9501eeb111",
    measurementId: "G-M4F4W17LRV"
};

export const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.warn);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
    signInWithPopup, signInWithRedirect, getRedirectResult,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendPasswordResetEmail, updateProfile, signOut,
    onAuthStateChanged,
    doc, getDoc, setDoc, updateDoc,
    collection, addDoc, getDocs, query, where,
    orderBy, limit, serverTimestamp, FieldValue
};

console.log("🔥 Firebase singleton initialized");