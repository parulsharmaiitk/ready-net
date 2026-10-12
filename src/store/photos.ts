import { del, get, set } from 'idb-keyval';
import { PHOTO_MAX_EDGE, PHOTO_QUALITY } from '../config';
import { store } from './db';

export async function savePhoto(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await set(id, blob, store('photos'));
  return id;
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  return get<Blob>(id, store('photos'));
}

export async function deletePhoto(id: string): Promise<void> {
  await del(id, store('photos'));
}

/** Resize to a 1280 px long edge and re-encode as JPEG at quality 0.7. */
export async function resizePhoto(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not encode photo'))),
      'image/jpeg',
      PHOTO_QUALITY,
    ),
  );
}
