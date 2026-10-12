import { del, get, set, values } from 'idb-keyval';
import { SCHEMA_VERSION } from '../config';
import type { CheckIn } from '../types';
import type { FlowStep } from '../logic/flow';
import { emitChange, store } from './db';

export async function saveCheckIn(checkIn: CheckIn): Promise<void> {
  await set(checkIn.id, checkIn, store('checkins'));
  emitChange('checkins');
}

export async function getCheckIn(id: string): Promise<CheckIn | undefined> {
  return get<CheckIn>(id, store('checkins'));
}

/** All saved check-ins, newest first. */
export async function listCheckIns(): Promise<CheckIn[]> {
  const all = await values<CheckIn>(store('checkins'));
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function lastCheckIn(): Promise<CheckIn | undefined> {
  return (await listCheckIns())[0];
}

/** The in-progress check-in plus where the user is in the flow. */
export interface Draft {
  schemaVersion: 1;
  checkIn: CheckIn;
  step: FlowStep;
  rescueNotified: boolean;
}

const DRAFT_KEY = 'current';

export async function loadDraft(): Promise<Draft | undefined> {
  return get<Draft>(DRAFT_KEY, store('draft'));
}

export async function saveDraft(draft: Draft): Promise<void> {
  await set(DRAFT_KEY, draft, store('draft'));
}

export async function clearDraft(): Promise<void> {
  await del(DRAFT_KEY, store('draft'));
}

export function newCheckIn(
  prefill?: Partial<Pick<CheckIn, 'location' | 'answers' | 'help'>>,
): CheckIn {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    location: { ...prefill?.location },
    answers: { ...prefill?.answers },
    photoIds: [],
    worse: false,
    help: prefill?.help ?? { willing: null, skills: [] },
    bringing: null,
    status: 'draft',
  };
}
