import { get, set } from 'idb-keyval';
import { SEND_DELAY_MS } from '../config';
import { getCheckIn, saveCheckIn } from './checkins';
import { store } from './db';

const KEY = 'queue';

export async function outboxIds(): Promise<string[]> {
  return (await get<string[]>(KEY, store('outbox'))) ?? [];
}

/** Mark a check-in as waiting to send. */
export async function enqueue(id: string): Promise<void> {
  const ids = await outboxIds();
  if (!ids.includes(id)) await set(KEY, [...ids, id], store('outbox'));
  const c = await getCheckIn(id);
  if (c && c.status !== 'queued') await saveCheckIn({ ...c, status: 'queued' });
}

let running: Promise<void> | null = null;

/**
 * Simulated sending: when online, wait a moment, mark each queued check-in "sent" and clear the outbox.
 * A real build would POST each check-in to the responders' server here.
 */
export function processOutbox(
  isOnline: () => boolean = () => navigator.onLine,
  delayMs = SEND_DELAY_MS,
): Promise<void> {
  if (running) return running;
  running = (async () => {
    if (!isOnline() || (await outboxIds()).length === 0) return;
    await new Promise((r) => setTimeout(r, delayMs));
    if (!isOnline()) return;
    const sending = await outboxIds();
    for (const id of sending) {
      const c = await getCheckIn(id);
      if (c) await saveCheckIn({ ...c, status: 'sent' });
    }
    // Keep anything queued while we were sending.
    const remaining = (await outboxIds()).filter((id) => !sending.includes(id));
    await set(KEY, remaining, store('outbox'));
  })().finally(() => {
    running = null;
  });
  return running;
}

/** Process on load and every time the device comes back online. */
export function startOutbox(): () => void {
  const handler = () => void processOutbox();
  handler();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
