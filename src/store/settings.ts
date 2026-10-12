import { useEffect, useState } from 'react';
import { DEMO_MODE_DEFAULT } from '../config';
import type { CheckIn } from '../types';
import { emitChange, onChange } from './db';

export interface Settings {
  schemaVersion: 1;
  demoMode: boolean;
  lastAddress: string;
  lastLoved: { L1?: string; L2?: string };
  lastHelp: CheckIn['help'];
  /** Supplies the user pledged to each cache, keyed by cache id. */
  cacheContributions: Record<string, string[]>;
  /** Rotates through the loved-ones demo sharing cases. */
  demoShareIndex: number;
}

const KEY = 'readynet.settings';

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  demoMode: DEMO_MODE_DEFAULT,
  lastAddress: '',
  lastLoved: {},
  lastHelp: { willing: null, skills: [] },
  cacheContributions: {},
  demoShareIndex: 0,
};

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep running with in-memory values for this session.
  }
  emitChange('settings');
  return next;
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  emitChange('settings');
}

export function useSettings(): Settings {
  const [settings, setSettings] = useState(getSettings);
  useEffect(() => onChange('settings', () => setSettings(getSettings())), []);
  return settings;
}
