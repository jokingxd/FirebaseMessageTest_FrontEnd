"use client";

import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
let messagingModule;

//REQUEST FOR FIREBASE TOKEN USING PUBLIC KEY 
export async function requestFirebaseToken(_swRegistration) {
    if (typeof window === "undefined") return null;

    try 
    {
    // Lazy import Firebase Messaging
        if (!messagingModule) 
        {
            messagingModule = await import("firebase/messaging");
        }

        const { getMessaging, getToken } = messagingModule;
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if(permission === "granted")
        {
            console.log("Notification Permission is granted");
        }
        else if (permission === "denied") 
        {
            console.log("Notification permission denied");
            return null;
        }
        else
        {
            console.log("Notification Permission is unknown");
        }
        

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: _swRegistration,
        });

        console.log("FCM token:", token);
        return token;
    } 
    catch (err) 
    {
        console.error("Error getting FCM token:", err);
        return null;
    }
}

//MESSAGE LISTENING
export async function onMessageListener(callback) {

    if (typeof window === "undefined") return;
    try 
    {
        if (!messagingModule) 
        {
            messagingModule = await import("firebase/messaging");
        }

        const { getMessaging, onMessage } = messagingModule;
        const messaging = getMessaging(app);

        onMessage(messaging, (payload) => 
        {
            console.log("Message received:", payload);
            callback(payload);
        });
    } 
    catch (err) 
    {
        console.error("Error listening to messages:", err);
    }
}
