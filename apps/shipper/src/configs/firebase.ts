// Firebase Configuration for Shipper App
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDkomBHfzU0-tg0O0j2gVb8JNwJgLU66xw",
    authDomain: "fo-delivery-food.firebaseapp.com",
    projectId: "fo-delivery-food",
    storageBucket: "fo-delivery-food.firebasestorage.app",
    messagingSenderId: "335231512180",
    appId: "1:335231512180:web:86e3ae93ad0ec73f782b21",
    measurementId: "G-N5NPVDXJ4B"
};

// VAPID Key from Firebase Console -> Cloud Messaging -> Web Push certificates
const VAPID_KEY = "BJ5QwuAlnxQP1L-k2wqbbKoi4IkCDJx8qy5ks75inPkAd6d8DsRz9i1RfeMu_4txaqG2vIbvS2Wzb8tiGqRkGCk";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging (only in browser with service worker support)
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
    if (!messaging) {
        console.warn('Firebase Messaging not supported');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.warn('Notification permission denied');
            return null;
        }

        // Get FCM token
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        console.log('[FCM] Token obtained:', token);
        return token;
    } catch (error) {
        console.error('[FCM] Error getting token:', error);
        return null;
    }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
    if (!messaging) return;

    return onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        callback(payload);
    });
};

export { messaging };
export default app;
