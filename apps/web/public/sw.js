/** Service worker — receives web push when the tab is closed and shows OS notifications. */

self.addEventListener("push", (event) => {
  let payload = {
    title: "AV Call Button",
    body: "New help request",
    data: { url: "/dashboard" },
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: payload.data ?? { url: "/dashboard" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data ?? {};
  const targetUrl =
    typeof data.url === "string" && data.url.length > 0
      ? data.url
      : "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
        return undefined;
      }),
  );
});
