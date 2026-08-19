// Firebase Configuration
// =====================================================================
// IMPORTANT: Replace the values below with your own Firebase project credentials
// Get these values from Firebase Console: https://console.firebase.google.com/
// =====================================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// =====================================================================
// PASTE YOUR FIREBASE CONFIG HERE
// =====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCl0IWh_lWSoaX0717P2zEAsy4aj7g0jFA",
  authDomain: "smartlms-b177e.firebaseapp.com",
  projectId: "smartlms-b177e",
  storageBucket: "smartlms-b177e.firebasestorage.app",
  messagingSenderId: "824755896362",
  appId: "1:824755896362:web:7c16234f22cd0447358353",
  measurementId: "G-8301KWGYBQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Export app for other modules
export default app;
