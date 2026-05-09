import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDTqUUewNFyTHzUnUrtIyCeFifmQt6W33o",
  authDomain: "chandra-daily-mart.firebaseapp.com",
  projectId: "chandra-daily-mart",
  storageBucket: "chandra-daily-mart.firebasestorage.app",
  messagingSenderId: "62190418721",
  appId: "1:62190418721:web:8c3455f018f971d6f0dc60",
  measurementId: "G-HKCLKRSWR4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services with support checks
export const auth = getAuth(app);

// Messaging may not be supported in all environments (e.g., some mobile browsers, incognito)
let messagingInstance = null;
try {
  // getMessaging() will throw if messaging is not supported in the environment
  messagingInstance = getMessaging(app);
} catch (err) {
  console.warn('Firebase Messaging not supported in this environment:', err);
}

export const messaging = messagingInstance;

// Analytics and Performance also need window check (though Vite handles this, it's safer)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const performance = typeof window !== 'undefined' ? getPerformance(app) : null;

export default app;
