importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDkomBHfzU0-tg0O0j2gVb8JNwJgLU66xw",
    authDomain: "fo-delivery-food.firebaseapp.com",
    projectId: "fo-delivery-food",
    storageBucket: "fo-delivery-food.firebasestorage.app",
    messagingSenderId: "335231512180",
    appId: "1:335231512180:web:86e3ae93ad0ec73f782b21",
    measurementId: "G-N5NPVDXJ4B"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Đơn hàng mới!';
    const notificationOptions = {
        body: payload.notification?.body || 'Bạn có đơn hàng mới cần nhận',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: payload.data, // Pass order data to notification click handler
        requireInteraction: true, // Keep notification visible
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    event.notification.close();

    // Focus or open the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/dashboard');
            }
        })
    );
});
