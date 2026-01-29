import api from '../utils/axiosConfig';
import app from '../configs/firebase';
import { getMessaging, getToken, onMessage as onFirebaseMessage } from 'firebase/messaging';

export interface APIResponse<T> {
    result?: T;
    message: string;
    code?: number;
}

export interface RegisterTokenRequest {
    userId: string;
    fcmToken: string;
    deviceType: 'WEB' | 'ANDROID' | 'IOS';
    role: string;
    merchantId?: number;
}

export interface NotificationMessage {
    id: string;
    title: string;
    body: string;
    receivedAt: Date;
    read: boolean;
}

type NotificationListener = (message: NotificationMessage) => void;

const listeners: NotificationListener[] = [];

// Initialize Firebase Messaging
let messaging: any;
try {
    messaging = getMessaging(app);

    // Listen for foreground messages
    onFirebaseMessage(messaging, (payload) => {
        console.log('[NotificationService] Message received: ', payload);
        const message: NotificationMessage = {
            id: payload.messageId || Date.now().toString(),
            title: payload.notification?.title || 'Thông báo mới',
            body: payload.notification?.body || '',
            receivedAt: new Date(),
            read: false
        };
        // Distribute to all listeners
        listeners.forEach(listener => listener(message));
    });
} catch (error) {
    console.warn('[NotificationService] Firebase Messaging failed to initialize (Context issue?):', error);
}

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
    simulateNotification: (title: string, body: string) => {
        const message: NotificationMessage = {
            id: Date.now().toString(),
            title,
            body,
            receivedAt: new Date(),
            read: false
        };
        listeners.forEach(l => l(message));
    },

    /**
     * Register device token for notifications
     * Endpoint: POST /api/v1/notification/device-token
     */
    registerToken: async (userId: string, fcmToken: string, role: string, merchantId?: number): Promise<APIResponse<void>> => {
        const payload: RegisterTokenRequest = {
            userId,
            fcmToken,
            deviceType: 'WEB',
            role,
            merchantId
        };
        try {
            const response = await api.post<APIResponse<void>>('/notification/device-token', payload);
            return response.data;
        } catch (error) {
            // Log but don't crash if backend is unreachable for notifications
            console.warn('Failed to register device token:', error);
            throw error;
        }
    },

    /**
     * Get FCM Token (Placeholder)
     * In a real implementation, this would initialize Firebase and get the token
     */
    getFcmToken: async (): Promise<string | null> => {
        if (!messaging) {
            console.warn('[NotificationService] Messaging not initialized');
            return null;
        }
        try {
            // Get Token without VAPID key (Firebase will use default Web Push certificate)
            const currentToken = await getToken(messaging);

            if (currentToken) {
                return currentToken;
            } else {
                console.warn('No registration token available. Request permission to generate one.');
                return null;
            }
        } catch (err) {
            console.warn('Notification permission denied or ignored:', err);
            return null;
        }
    }
};

export default notificationService;
