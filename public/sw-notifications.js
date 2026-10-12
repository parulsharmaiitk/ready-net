/* Imported by the generated service worker. Opens the URL stored on a notification when it is tapped. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(
    (event.notification.data && event.notification.data.url) || './',
    self.registration.scope,
  ).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'navigate', url: target });
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
