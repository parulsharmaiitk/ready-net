import { clearAllStores, emitChange } from './db';
import { clearSettings } from './settings';

/** "Delete all my data": every IndexedDB store and the settings in localStorage. */
export async function deleteAllData(): Promise<void> {
  await clearAllStores();
  clearSettings();
  emitChange('checkins');
  emitChange('lovedOnes');
  emitChange('caches');
}
