"use client";

import { useEffect, useState } from "react";
import { requestFirebaseToken, onMessageListener } from "../firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Page() {
  const [lastToken, setLastToken] = useState(typeof window !== "undefined" ? localStorage.getItem("fcm_token") : null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let intervalId;

    const registerToken = async (_registration) => {
      console.log("ATTEMPT TO REQUEST TOKEN");
      const token = await requestFirebaseToken(_registration);
      console.log("TOKEN IS:", token);
      const storedToken = localStorage.getItem("fcm_token");
      // if (token && token !== storedToken) 
      // {
        try 
        {
          if(!token)
            throw new Error("FCM Token is missing.");
          console.log("attempting to send to backend");
          const API_URL = process.env.NEXT_PUBLIC_APP_URL || "";
          fetch(`${API_URL}/api/registerToken`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ m_ID: 1, m_Token: token }) 
          })
          .then((res) => res.json())
          .then((data) => console.log("Token registered:", data))
          .catch(console.error);

          console.log("Token sent to backend:", token);

          setLastToken(token);
          localStorage.setItem("fcm_token", token);
        } 
        catch (err) 
        {
          console.error("Failed to send token to backend:", err);
        }
      // }
    };

    const onListener = async () => {
      await onMessageListener((payload) => {
        console.log("Foreground message:", payload);
        setMessages((prev) => [...prev, payload.data]);

        // const img = new Image();
        // img.crossOrigin = "anonymous";
        // console.warn(payload.data?.image);
        // img.src = payload.data?.image;

        // img.onload = () =>
        // {
        //   const queue = "1000";
        //   const time = "1900H";
        //   const date = "11/11/11";
        //   const canvas = document.createElement("canvas");
        //   const ctx = canvas.getContext("2d");
        //   canvas.width = img.width;
        //   canvas.height = img.height;

        //   ctx.drawImage(img, 0, 0);

        //   ctx.font = "bold 32px Arial";
        //   ctx.fillStyle = "white";
        //   ctx.fillText(`Queue: ${queue}`, 50, 100);
        //   ctx.fillText(`Time: ${time}`, 50, 150);
        //   ctx.fillText(`Date: ${date}`, 50, 200);

        //   const finalImage = canvas.toDataURL("image/png");

        //   // new Notification("Queue Update", {
        //   //   body: `Queue ${queue} at ${time} ${date}`,
        //   //   icon: finalImage,
        //   // });

        //   toast(
        //   // <div style={{ display: "flex", alignItems: "center" }}>
        //     <div style={{ 
        //         display: "flex", 
        //         flexDirection: "column", 
        //         alignItems: "flex-start", 
        //         maxWidth: "300px" // optional
        //       }}>
        //       {finalImage && (
        //         <img
        //           src={finalImage}
        //           alt="notification"
        //           style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "contain", marginBottom: 8 }}
        //         />
        //       )}
        //       <div>
        //         <strong style={{ marginBottom: "4px" }}>{payload.data?.title}</strong>
        //         <div>{payload.data?.body}</div>
        //       </div>
        //     </div>,
        //     {
        //       position: "top-right",
        //       autoClose: 5000,
        //       hideProgressBar: false,
        //       closeOnClick: true,
        //       pauseOnHover: true,
        //       draggable: true,
        //     }
        //   );

        // };

        toast(
          // <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "flex-start", 
              maxWidth: "300px" // optional
            }}>
            {payload.data?.image && (
              <img
                src={payload.data?.image}
                alt="notification"
                style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "contain", marginBottom: 8 }}
              />
            )}
            <div>
              <strong style={{ marginBottom: "4px" }}>{payload.data?.title}</strong>
              <div>{payload.data?.body}</div>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

      }); 
    };

    const registerServiceWorker = async () => {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      // if (!registration.active && registration.installing) {
      //   await new Promise(resolve => {
      //     registration.installing.addEventListener("statechange", () => {
      //       if (registration.installing.state === "activated") resolve();
      //     });
      //   });
      // }

      await new Promise((resolve) => {
        let worker = registration.installing || registration.waiting;
        if (!worker) 
          {
          // SW already active, resolve immediately
          resolve();
          return;
        }

        worker.addEventListener("statechange", () => {
            if (worker.state === "activated") resolve();
        });
      });

      return registration;
    };

    const init = async () => {
      if ("serviceWorker" in navigator) {
        const registration = await registerServiceWorker();

        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "NEW_PUSH") {
            setMessages((prev) => [...prev, event.data.payload]);
          }
        });

        await registerToken(registration);
        intervalId = setInterval(() => registerToken(registration), 1000 * 60 * 60);
        onListener();
      }
    }

    init();


    // if ("serviceWorker" in navigator) 
    // {
    //     navigator.serviceWorker
    //           .register("/firebase-messaging-sw.js")
    //           .then((registration) => 
    //           {
    //             console.log("Service Worker registered,", registration);

    //             if (registration.active) {
    //               console.log("SW is active, safe to call getToken");
    //               registerToken(registration);
    //               intervalId = setInterval(registerToken, 1000 * 60 * 60);
    //               onListener();
    //             } else {
    //               // Listen for activation
    //               registration.addEventListener("updatefound", () => {
    //                 const newWorker = registration.installing;
    //                 newWorker.addEventListener("statechange", () => {
    //                   if (newWorker.state === "activated") {
    //                     console.log("SW activated, safe to call getToken");
    //                     registerToken(registration);
    //                     intervalId = setInterval(registerToken, 1000 * 60 * 60);
    //                     onListener();
    //                   }
    //                 });
    //               });
    //             }
    //           })
    //           .catch(console.error);
    // }
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Push Notification Demo</h1>
      <h2>Received Messages:</h2>
      <ul>
        {messages.map((msg, i) => (
          // <li key={i}>
          //   {msg?.title}: {msg?.body}
          // </li>
            <div key ={i}>
              <img src={msg?.image} alt="queue" style={{ width: "50%" }} />
              <p>{msg?.title}</p>
              <p>{msg?.body}</p>
            </div>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
}
