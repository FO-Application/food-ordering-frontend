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

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg' // Fallback icon, replace with your app icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
