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
    data?: {
        orderId?: string;
        type?: string;
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
        console.log('[NotificationService] Foreground message received: ', payload);
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
                console.log('[NotificationService] Background message received via SW: ', event.data.payload);
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
    console.warn('[NotificationService] Firebase Messaging failed to initialize (Context issue?):', error);
}

// VAPID Key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push Certificates
// IMPORTANT: Replace this with your actual VAPID key from Firebase Console
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
     * Get FCM Token with VAPID Key
     * Required for Web Push to work correctly
     */
    getFcmToken: async (): Promise<string | null> => {
        if (!messaging) {
            console.warn('[NotificationService] Messaging not initialized');
            return null;
        }
        try {
            // Get Token WITH VAPID key (required for Web Push)
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

            if (currentToken) {
                console.log('[NotificationService] Got FCM Token:', currentToken.substring(0, 20) + '...');
                return currentToken;
            } else {
                console.warn('No registration token available. Request permission to generate one.');
                return null;
            }
        } catch (err) {
            console.warn('FCM Token error (check VAPID key and permissions):', err);
            return null;
        }
    },

    // ========== HISTORY & MANAGEMENT API ==========

    /**
     * Get notification history for a merchant
     * Endpoint: GET /api/v1/notification/history/{merchantId}
     */
    getHistory: async (merchantId: number): Promise<NotificationMessage[]> => {
        try {
            const response = await api.get<APIResponse<any[]>>(`/notification/history/${merchantId}`);
            const notifications = response.data.result || [];
            return notifications.map(n => ({
                id: String(n.id),
                title: n.title,
                body: n.message,
                // Append 'Z' to indicate UTC time from server (Docker runs in UTC)
                receivedAt: new Date(n.createdAt + 'Z'),
                read: n.isRead,
                data: { orderId: n.referenceId ? String(n.referenceId) : undefined }
            }));
        } catch (error) {
            console.warn('Failed to fetch notification history:', error);
            return [];
        }
    },

    /**
     * Mark a single notification as read
     * Endpoint: PUT /api/v1/notification/{id}/read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        try {
            await api.put(`/notification/${notificationId}/read`);
        } catch (error) {
            console.warn('Failed to mark notification as read:', error);
        }
    },

    /**
     * Mark all notifications as read for a merchant
     * Endpoint: PUT /api/v1/notification/read-all/{merchantId}
     */
    markAllAsRead: async (merchantId: number): Promise<void> => {
        try {
            await api.put(`/notification/read-all/${merchantId}`);
        } catch (error) {
            console.warn('Failed to mark all notifications as read:', error);
        }
    },

    /**
     * Delete a single notification
     * Endpoint: DELETE /api/v1/notification/{id}
     */
    deleteNotification: async (notificationId: string): Promise<void> => {
        try {
            await api.delete(`/notification/${notificationId}`);
        } catch (error) {
            console.warn('Failed to delete notification:', error);
        }
    },

    /**
     * Delete all notifications for a merchant
     * Endpoint: DELETE /api/v1/notification/delete-all/{merchantId}
     */
    deleteAllNotifications: async (merchantId: number): Promise<void> => {
        try {
            await api.delete(`/notification/delete-all/${merchantId}`);
        } catch (error) {
            console.warn('Failed to delete all notifications:', error);
        }
    }
};

export default notificationService;
