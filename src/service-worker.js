self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting(); // Per attivare immediatamente il nuovo SW
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
});

self.addEventListener("message", (event) => {
  console.log("ho ricevuto messaggio", event.data);
});

self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icon.png",
    badge: "/badge.png",
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
