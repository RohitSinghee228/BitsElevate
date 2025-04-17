// Import the Firebase SDK
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfIqGcqkZ1aUAvhF3lmHQLfWdz9OJsUX8",
  authDomain: "bitselevate-auth.firebaseapp.com",
  projectId: "bitselevate-auth",
  storageBucket: "bitselevate-auth.appspot.com",
  messagingSenderId: "423018250548",
  appId: "1:423018250548:web:6b4a5f52d12345678901ab"
};

// Initialize Firebase - only if no app exists already
let app;
try {
  // Check if a Firebase app already exists
  const existingApps = getApps();
  if (existingApps.length === 0) {
    // No app exists, so create one
    console.log('Initializing new Firebase app');
    app = initializeApp(firebaseConfig);
  } else {
    // Use the existing app
    console.log('Using existing Firebase app');
    app = existingApps[0];
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create fallback Firebase config to prevent crashes
  if (!app) {
    console.log('Using fallback Firebase config');
    app = initializeApp({
      apiKey: "demo-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-app",
    }, 'fallback-app');
  }
}

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  // Force account selection even when one account is available
  prompt: 'select_account',
  // Set BITS-Pilani domain hint
  hd: 'pilani.bits-pilani.ac.in'
});

export { auth, googleProvider }; 