export const GET = async (req, res) => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const swContent = `
        self.addEventListener("install", () => {
          console.log("Firebase SW installed (before background handling).");
        });

        console.log("Service Worker: starting up");
        try {
            // importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
            // importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
            importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js');
            importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js');
            console.log("SW: scripts imported");
        } catch (e) {
            console.error("SW: importScripts failed", e);
        }

        try 
        {
            firebase.initializeApp(${JSON.stringify(firebaseConfig)});
            console.log("SW: firebase initialized");
        } catch (e) {
            console.error("SW: firebase init failed", e);
        }

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage(function(payload) {
          console.log("Background message received:", payload);

          self.registration.showNotification(payload.data.title, {
              body: payload.data.body,
              icon: '/icon.png',
              image: payload.data.image
          });

          self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
            clients.forEach((client) => {
              client.postMessage({ type: "NEW_PUSH", payload: payload.data });
            });
          });

        });


        // console.log("Service Worker: starting up");

        // import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
        // import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-sw.js";

        // const app = initializeApp(${JSON.stringify(firebaseConfig)});
        // const messaging = getMessaging(app);

        // console.log("FireBase App Initialized");

        // onBackgroundMessage(messaging, (payload) => {
        //   console.log("Background message received:", payload);

        //   self.registration.showNotification(payload.notification.title, {
        //     body: payload.notification.body,
        //     icon: '/icon.png',
        //     image: payload.notification.image
        //   });
        // });

        `;

  return new Response(swContent, {
    status: 200,
    headers: { "Content-Type": "application/javascript" },
  });
};
