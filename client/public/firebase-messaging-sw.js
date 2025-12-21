importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBr8i4w4iiGH2gtQ50I2n4cVPu9ZaIR-ng",
  authDomain: "fairq-fb284.firebaseapp.com",
  projectId: "fairq-fb284",
  storageBucket: "fairq-fb284.firebasestorage.app",
  messagingSenderId: "977159171584",
  appId: "1:977159171584:web:afeb26bb1759b3343ab2e5",
  measurementId: "G-2KMH0HXCQ3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/logo.png",
    }
  );
});
