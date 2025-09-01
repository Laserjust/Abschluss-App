// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { mockFirestore } from './mockFirestore.js';

// Your web app's Firebase configuration
// Using demo configuration for development
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-XXXXXXXXXX"
};

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Initialize Firebase only in production
let app = null;
let db = null;
let auth = null;
let storage = null;
let messaging = null;

if (isDevelopment) {
  // Use mock implementations in development
  db = mockFirestore;
  // Create minimal mock objects for auth and storage
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      // No automatic login - user will see login screen
      setTimeout(() => callback(null), 100);
      return () => {}; // unsubscribe function
    },
    signOut: () => Promise.resolve()
  };
  storage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } })
    })
  };
} else {
  // Initialize Firebase for production
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  // Initialize Firebase Cloud Messaging
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    }).catch((error) => {
      console.error('Error checking messaging support:', error);
    });
  }
}

export { app, db, auth, storage, messaging };

// Note: Replace "YOUR_API_KEY", "YOUR_MESSAGING_SENDER_ID", and "YOUR_APP_ID" 
// with actual Firebase configuration values when deploying the application.