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

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Thông báo mới';
    const notificationBody = payload.notification?.body || '';
    const notificationOptions = {
        body: notificationBody,
        icon: '/vite.svg', // Fallback icon, replace with your app icon
        data: payload.data // Pass any custom data
    };

    // Show system notification
    self.registration.showNotification(notificationTitle, notificationOptions);

    // Forward to all clients (main app) so it appears in the in-app notification dropdown
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'FCM_BACKGROUND_MESSAGE',
                payload: {
                    title: notificationTitle,
                    body: notificationBody,
                    data: payload.data,
                    messageId: payload.messageId || Date.now().toString()
                }
            });
        });
    });
});
