import cacheData from '../data/caches.json';

export interface Cache {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  supplies: string[];
  needed: string[];
}

export interface CacheView extends Cache {
  open: boolean;
  distanceMi: number;
}

export const CACHES: Cache[] = cacheData.caches;
export const USER_POSITION = cacheData.userPosition;
export const RISK_ZONE = cacheData.riskZone;

export function insideRiskZone(p: { x: number; y: number }): boolean {
  return Math.hypot(p.x - RISK_ZONE.x, p.y - RISK_ZONE.y) <= RISK_ZONE.r;
}

/** Fake distance in miles, computed from map positions. */
export function distanceMi(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * cacheData.mapScaleMilesPerUnit * 10) / 10;
}

/** All caches nearest first, with open/closed state. Caches inside the zone close when risk is high. */
export function cachesFor(risk: 'high' | 'low', caches: Cache[] = CACHES): CacheView[] {
  return caches
    .map((c) => ({
      ...c,
      open: !(risk === 'high' && insideRiskZone(c)),
      distanceMi: distanceMi(USER_POSITION, c),
    }))
    .sort((a, b) => a.distanceMi - b.distanceMi);
}

export function nearestOpen(risk: 'high' | 'low', caches: Cache[] = CACHES): CacheView | undefined {
  return cachesFor(risk, caches).find((c) => c.open);
}

/** Merge neighbor supplies with what the user has pledged, without duplicates. */
export function mergeSupplies(base: string[], mine: string[]): string[] {
  return [...new Set([...base, ...mine])];
}
