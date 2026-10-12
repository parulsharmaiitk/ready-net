import { describe, expect, it } from 'vitest';
import {
  CACHES,
  cachesFor,
  distanceMi,
  insideRiskZone,
  mergeSupplies,
  nearestOpen,
} from './caches';
import { lovedOnesShareText } from './lovedOnes';

describe('caches', () => {
  it('ships four caches with exactly one inside the high-risk zone', () => {
    expect(CACHES).toHaveLength(4);
    expect(CACHES.filter(insideRiskZone)).toHaveLength(1);
  });

  it('closes the cache inside the zone only when risk is high', () => {
    expect(cachesFor('high').filter((c) => !c.open)).toHaveLength(1);
    expect(cachesFor('low').every((c) => c.open)).toBe(true);
  });

  it('sorts caches nearest first', () => {
    const d = cachesFor('low').map((c) => c.distanceMi);
    expect(d).toEqual([...d].sort((a, b) => a - b));
  });

  it('never picks a closed cache as nearest open', () => {
    expect(nearestOpen('high')?.open).toBe(true);
  });

  it('computes a distance in miles from map positions', () => {
    expect(distanceMi({ x: 0, y: 0 }, { x: 30, y: 40 })).toBe(1.3);
  });

  it('merges supplies without duplicates', () => {
    expect(mergeSupplies(['Water', 'Food'], ['Food', 'Tools'])).toEqual(['Water', 'Food', 'Tools']);
  });
});

describe('lovedOnesShareText', () => {
  it.each([
    [{ L1: 'yes', L2: 'yes' }, 'Status + location shared'],
    [{ L1: 'yes', L2: 'no' }, 'Status shared'],
    [{ L1: 'no', L2: 'yes' }, 'Location shared'],
    [{ L1: 'no', L2: 'no' }, 'Notified you checked in'],
  ])('%o → %s', (answers, text) => {
    expect(lovedOnesShareText(answers)).toBe(text);
  });
});
