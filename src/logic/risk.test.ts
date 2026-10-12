import { describe, expect, it } from 'vitest';
import { areaRisk } from './risk';

describe('areaRisk', () => {
  it('is low with no hazards', () => {
    expect(areaRisk({ E1: 'no', E2: 'no', E3: 'no', E4: 'no', E5: 'no', E6: 'no' })).toEqual({
      level: 'low',
      rescueAlert: false,
      hazards: [],
    });
  });

  it.each(['E1', 'E2', 'E3', 'E4'])('is high when %s = Yes', (id) => {
    expect(areaRisk({ [id]: 'yes' }).level).toBe('high');
  });

  it('lists E5 and E6 as hazards without raising risk', () => {
    const r = areaRisk({ E5: 'yes', E6: 'yes' });
    expect(r.level).toBe('low');
    expect(r.hazards).toEqual(['Power lines down or power out', 'Blocked roads']);
  });

  it('sends a rescue alert only when someone is trapped', () => {
    expect(areaRisk({ E1: 'yes' }).rescueAlert).toBe(true);
    expect(areaRisk({ E1: 'unsure' }).rescueAlert).toBe(false);
    expect(areaRisk({ E1: 'unsure' }).level).toBe('low');
  });
});
