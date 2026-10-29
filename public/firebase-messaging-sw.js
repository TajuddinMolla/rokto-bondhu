// RoktoBondhu - Firebase Cloud Messaging Service Worker

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notification = payload.notification || {};
    const data = payload.data || {};

    const title = notification.title || data.title || "রক্তবন্ধু • RoktoBondhu";
    const body = notification.body || data.body || "নতুন জরুরি রক্তদান সংক্রান্ত আপডেট রয়েছে।";
    const targetUrl = data.url || "/account/notifications";

    const options = {
      body,
      icon: notification.icon || "/favicon.ico",
      badge: notification.badge || "/favicon.ico",
      tag: data.tag || "roktobondhu-alert",
      data: {
        url: targetUrl,
      },
      requireInteraction: data.urgency === "critical",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.warn("[SW] Push handling error:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If an open window is on the same URL, focus it
        for (const client of windowClients) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // If an open window exists on this origin, navigate it and focus
        for (const client of windowClients) {
          if ("focus" in client && "navigate" in client) {
            return client.navigate(targetUrl).then((focusedClient) => {
              return focusedClient ? focusedClient.focus() : null;
            });
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});