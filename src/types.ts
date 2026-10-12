export type Color = 'red' | 'yellow' | 'green' | 'white';

/** question id -> option id */
export type Answers = Record<string, string>;

export interface CheckIn {
  schemaVersion: 1;
  id: string;
  startedAt: string;
  completedAt?: string;
  location: { lat?: number; lng?: number; accuracyM?: number; text?: string };
  answers: Answers;
  photoIds: string[];
  worse: boolean;
  color?: Color;
  risk?: 'high' | 'low';
  rescueAlert?: boolean;
  help: { willing: boolean | null; skills: string[] };
  bringing: { cacheId: string; items: string[] } | null;
  status: 'draft' | 'queued' | 'sent';
}

export interface LovedOne {
  id: string;
  name: string;
  contact: string;
  state: 'pending' | 'active';
  lastCheckIn?: { at: string; color?: Color; position?: { x: number; y: number } };
}

export interface AidStep {
  id: string;
  title: string;
  text: string;
}
