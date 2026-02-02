import api from '../utils/axiosConfig';
import { requestNotificationPermission, onForegroundMessage } from '../configs/firebase';
import { MessagePayload } from 'firebase/messaging';

export interface OrderPushData {
    orderId: string;
    pickupAddress: string;
    shippingFee: string;
    lat?: string;
    lon?: string;
}

// Register FCM token with backend
export const registerFCMToken = async (userId: number, fcmToken: string): Promise<void> => {
    try {
        await api.post('/notification/device-token', {
            userId,
            fcmToken,
            deviceType: 'WEB',
            role: 'SHIPPER',
            merchantId: null
        });
        console.log('[Notification] FCM token registered with backend');
    } catch (error) {
        console.error('[Notification] Failed to register FCM token:', error);
    }
};

// Initialize push notifications for shipper
export const initializePushNotifications = async (
    userId: number,
    onNewOrder: (order: OrderPushData) => void
): Promise<boolean> => {
    try {
        // 1. Request permission and get token
        const fcmToken = await requestNotificationPermission();

        if (!fcmToken) {
            console.warn('[Notification] Could not get FCM token');
            return false;
        }

        // 2. Register token with backend
        await registerFCMToken(userId, fcmToken);

        // 3. Listen for foreground messages
        onForegroundMessage((payload: MessagePayload) => {
            console.log('[Notification] New order received:', payload);

            // Extract order data from notification
            const data = payload.data as unknown as OrderPushData;
            if (data?.orderId) {
                onNewOrder(data);
            }
        });

        console.log('[Notification] Push notifications initialized successfully');
        return true;
    } catch (error) {
        console.error('[Notification] Failed to initialize:', error);
        return false;
    }
};

export default {
    registerFCMToken,
    initializePushNotifications
};
