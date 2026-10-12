import { showBanner } from './bus';

interface NotifyOptions {
  /** Hash route to open when the notification is tapped, e.g. "#/alert". */
  url?: string;
  /** Label for the in-app banner action when notifications are unavailable. */
  actionLabel?: string;
  tone?: 'alert' | 'info';
  tag?: string;
  /** Set false when the screen already shows the same message. */
  fallbackBanner?: boolean;
}

/**
 * Show a local notification. Permission is requested here, the first time a user action needs it —
 * never on load. If permission is denied or unsupported, the same message shows as an in-app banner.
 */
export async function notify(title: string, body: string, opts: NotifyOptions = {}): Promise<void> {
  const fallback = () =>
    opts.fallbackBanner !== false &&
    showBanner({
      tone: opts.tone ?? 'info',
      title,
      body,
      action: opts.url
        ? { label: opts.actionLabel ?? 'Open', to: opts.url.replace(/^#/, '') }
        : undefined,
    });

  if (!('Notification' in window)) return void fallback();
  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = 'denied';
    }
  }
  if (permission !== 'granted') return void fallback();

  const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon,
        badge: icon,
        tag: opts.tag,
        data: { url: opts.url },
      });
      return;
    }
    // No service worker (e.g. dev server): fall back to a page notification.
    const n = new Notification(title, { body, icon, tag: opts.tag });
    n.onclick = () => {
      window.focus();
      if (opts.url) window.location.hash = opts.url;
      n.close();
    };
  } catch {
    fallback();
  }
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}
