// Tiny app-wide message bus for banners, toasts and screen-reader announcements.

export interface Banner {
  id: string;
  tone: 'alert' | 'info';
  title: string;
  body?: string;
  action?: { label: string; to: string };
}

const bus = new EventTarget();

export function showBanner(banner: Omit<Banner, 'id'>): void {
  bus.dispatchEvent(
    new CustomEvent<Banner>('banner', { detail: { ...banner, id: crypto.randomUUID() } }),
  );
}

export function onBanner(fn: (b: Banner) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<Banner>).detail);
  bus.addEventListener('banner', h);
  return () => bus.removeEventListener('banner', h);
}

/** Announce text through the app's aria-live region. */
export function announce(text: string): void {
  bus.dispatchEvent(new CustomEvent<string>('announce', { detail: text }));
}

export function onAnnounce(fn: (text: string) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<string>).detail);
  bus.addEventListener('announce', h);
  return () => bus.removeEventListener('announce', h);
}
