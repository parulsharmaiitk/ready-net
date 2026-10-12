import { Workbox } from 'workbox-window';

let wb: Workbox | undefined;

/**
 * Registers the generated service worker. The worker updates itself (autoUpdate); when a new version
 * takes over or is waiting we call onUpdate so the app can show "Update available — reload" instead of
 * reloading under the user mid check-in.
 */
export function registerSW(onUpdate: () => void): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  // Notification taps: the worker asks an open window to navigate.
  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    if (e.data?.type === 'navigate' && typeof e.data.url === 'string')
      window.location.href = e.data.url;
  });

  wb = new Workbox(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
  wb.addEventListener('waiting', onUpdate);
  wb.addEventListener('controlling', (e) => {
    if (e.isUpdate) onUpdate();
  });
  void wb.register().then(() => {
    setInterval(() => void wb?.update(), 60 * 60 * 1000);
  });
}

export function applyUpdate(): void {
  if (!wb) return window.location.reload();
  wb.addEventListener('controlling', () => window.location.reload());
  wb.messageSkipWaiting();
  // If the new worker already took control there is nothing waiting; just reload.
  setTimeout(() => window.location.reload(), 500);
}
