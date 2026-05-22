const DEFAULT_ICON = "/android-chrome-192x192.png";
const DEFAULT_BADGE = "/favicon-32x32.png";
const DEFAULT_URL = "/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = {
        title: "FLOW",
        body: event.data.text(),
      };
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "FLOW", {
      body: payload.body || "",
      icon: payload.icon || DEFAULT_ICON,
      badge: payload.badge || DEFAULT_BADGE,
      tag: payload.tag || undefined,
      renotify: Boolean(payload.renotify),
      data: {
        url: payload.url || DEFAULT_URL,
        kind: payload.kind || null,
        ...(payload.data || {}),
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || DEFAULT_URL;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        const wantedUrl = new URL(targetUrl, self.location.origin);

        for (const client of clients) {
          const clientUrl = new URL(client.url);

          if (clientUrl.origin === wantedUrl.origin) {
            client.navigate(wantedUrl.href);
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
