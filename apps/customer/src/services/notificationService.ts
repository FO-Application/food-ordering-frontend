import app from '../configs/firebase';
import { getMessaging, getToken, onMessage as onFirebaseMessage } from 'firebase/messaging';

export interface NotificationMessage {
    id: string;
    title: string;
    body: string;
    receivedAt: Date;
    read: boolean;
    data?: {
        orderId?: string;
        type?: string;
        status?: string;
        [key: string]: any;
    };
}

type NotificationListener = (message: NotificationMessage) => void;

const listeners: NotificationListener[] = [];

// Initialize Firebase Messaging
let messaging: any;
try {
    messaging = getMessaging(app);

    // Listen for foreground messages
    onFirebaseMessage(messaging, (payload) => {
        console.log('[CustomerNotificationService] Foreground message received: ', payload);
        const message: NotificationMessage = {
            id: payload.messageId || Date.now().toString(),
            title: payload.notification?.title || 'Thông báo mới',
            body: payload.notification?.body || '',
            receivedAt: new Date(),
            read: false,
            data: payload.data as NotificationMessage['data']
        };
        // Distribute to all listeners
        listeners.forEach(listener => listener(message));
    });

    // Listen for messages from Service Worker (background notifications)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'FCM_BACKGROUND_MESSAGE') {
                console.log('[CustomerNotificationService] Background message received via SW: ', event.data.payload);
                const message: NotificationMessage = {
                    id: event.data.payload.messageId || Date.now().toString(),
                    title: event.data.payload.title || 'Thông báo mới',
                    body: event.data.payload.body || '',
                    receivedAt: new Date(),
                    read: false,
                    data: event.data.payload.data as NotificationMessage['data']
                };
                // Distribute to all listeners
                listeners.forEach(listener => listener(message));
            }
        });
    }
} catch (error) {
    console.warn('[CustomerNotificationService] Firebase Messaging failed to initialize:', error);
}

// VAPID Key from Firebase Console
const VAPID_KEY = 'BJ5QwxAkrxQP1L-k2wqbbKoi4lkCDJx8qy5ks75inPkAd6d8DsRz9i1RfeMu_4txaqG2vlbvS2Wzb8tiGgRkGCk';

const notificationService = {
    /**
     * Subscribe to incoming notifications
     */
    onMessage: (listener: NotificationListener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },

    /**
     * Simulate receiving a notification (For demo purposes)
     */
    simulateNotification: (title: string, body: string, data?: NotificationMessage['data']) => {
        const message: NotificationMessage = {
            id: Date.now().toString(),
            title,
            body,
            receivedAt: new Date(),
            read: false,
            data
        };
        listeners.forEach(l => l(message));
    },

    /**
     * Get FCM Token with VAPID Key
     */
    getFcmToken: async (): Promise<string | null> => {
        if (!messaging) {
            console.warn('[CustomerNotificationService] Messaging not initialized');
            return null;
        }
        try {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
                console.log('[CustomerNotificationService] Got FCM Token:', currentToken.substring(0, 20) + '...');
                return currentToken;
            } else {
                console.warn('No registration token available.');
                return null;
            }
        } catch (err) {
            console.warn('FCM Token error:', err);
            return null;
        }
    }
};

export default notificationService;
