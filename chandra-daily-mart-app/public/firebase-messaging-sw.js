importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDTqUUewNFyTHzUnUrtIyCeFifmQt6W33o",
  authDomain: "chandra-daily-mart.firebaseapp.com",
  projectId: "chandra-daily-mart",
  storageBucket: "chandra-daily-mart.firebasestorage.app",
  messagingSenderId: "62190418721",
  appId: "1:62190418721:web:8c3455f018f971d6f0dc60"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
