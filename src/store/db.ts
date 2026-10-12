import { clear, createStore, type UseStore } from 'idb-keyval';

type StoreName = 'checkins' | 'draft' | 'photos' | 'outbox' | 'lovedOnes';

const cache = new Map<StoreName, UseStore>();

/** One IndexedDB database per store, created lazily (idb-keyval keeps one object store per database). */
export function store(name: StoreName): UseStore {
  let s = cache.get(name);
  if (!s) {
    s = createStore(`readynet-${name}`, name);
    cache.set(name, s);
  }
  return s;
}

export const ALL_STORES: StoreName[] = ['checkins', 'draft', 'photos', 'outbox', 'lovedOnes'];

export async function clearAllStores(): Promise<void> {
  await Promise.all(ALL_STORES.map((name) => clear(store(name))));
}

/** Lightweight change notifications so screens can refresh when stored data changes. */
export const dataEvents = new EventTarget();
export type DataTopic = 'checkins' | 'lovedOnes' | 'settings' | 'caches';

export function emitChange(topic: DataTopic): void {
  dataEvents.dispatchEvent(new Event(topic));
}

export function onChange(topic: DataTopic, fn: () => void): () => void {
  dataEvents.addEventListener(topic, fn);
  return () => dataEvents.removeEventListener(topic, fn);
}
