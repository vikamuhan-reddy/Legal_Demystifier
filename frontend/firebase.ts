// Fix: Use Firebase v9 compat libraries to fix initializeApp import issue.
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

// --- Firebase Configuration ---
// This is the new location for your Firebase config.
// 1. Go to your Firebase project's settings.
// 2. Under "Your apps" -> "Web app", find your SDK configuration snippet.
// 3. Copy the `firebaseConfig` object and paste it below, replacing this example object.
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxx"
};
// -----------------------------


// Initialize Firebase
export const app = firebase.initializeApp(firebaseConfig);
