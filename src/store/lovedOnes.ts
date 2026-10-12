import { del, set, values } from 'idb-keyval';
import type { LovedOne } from '../types';
import { emitChange, store } from './db';

export async function listLovedOnes(): Promise<LovedOne[]> {
  const all = await values<LovedOne>(store('lovedOnes'));
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveLovedOne(person: LovedOne): Promise<void> {
  await set(person.id, person, store('lovedOnes'));
  emitChange('lovedOnes');
}

export async function removeLovedOne(id: string): Promise<void> {
  await del(id, store('lovedOnes'));
  emitChange('lovedOnes');
}
