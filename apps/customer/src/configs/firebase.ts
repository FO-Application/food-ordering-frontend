// Firebase Configuration for Social Authentication
// Replace placeholder values with your actual Firebase project credentials
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDkomBHfzU0-tg0O0j2gVb8JNwJgLU66xw",
    authDomain: "fo-delivery-food.firebaseapp.com",
    projectId: "fo-delivery-food",
    storageBucket: "fo-delivery-food.firebasestorage.app",
    messagingSenderId: "335231512180",
    appId: "1:335231512180:web:86e3ae93ad0ec73f782b21",
    measurementId: "G-N5NPVDXJ4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Optional: Add scopes for additional user info
googleProvider.addScope('email');
googleProvider.addScope('profile');

// CRITICAL: Force account selection every time
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export { auth, googleProvider, facebookProvider };
export default app;
