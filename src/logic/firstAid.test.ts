import { describe, expect, it } from 'vitest';
import { firstAid } from './firstAid';
import { triage } from './triage';

const base = { C1: 'no', C2: 'yes', C3: 'no', C4: 'yes', C5: 'no' };
const ids = (answers: Record<string, string>, worse = false) =>
  firstAid(answers, triage(answers, worse)).map((s) => s.id);

describe('firstAid', () => {
  it('shows no steps for white', () => {
    expect(ids(base)).toEqual([]);
  });

  it('shows tie-above-the-wound for an arm or leg with spurting bleeding', () => {
    expect(ids({ ...base, C3: 'yes', B1: 'limb', B2: 'spurting', B3: 'slows', B4: 'no' })).toEqual([
      'press',
      'hold',
      'tourniquet',
      'shock',
    ]);
  });

  it('shows tie-above-the-wound when pressure does not slow limb bleeding', () => {
    expect(ids({ ...base, C3: 'yes', B1: 'limb', B2: 'ooze', B3: 'no' })).toContain('tourniquet');
  });

  it('does not show tie-above-the-wound for slow limb bleeding that slows', () => {
    expect(ids({ ...base, C3: 'yes', B1: 'limb', B2: 'ooze', B3: 'slows' })).not.toContain(
      'tourniquet',
    );
  });

  it('never shows tie-above-the-wound for the head or neck', () => {
    const steps = ids({ ...base, C3: 'yes', B1: 'head', B2: 'spurting', B3: 'no', B4: 'no' });
    expect(steps).not.toContain('tourniquet');
    expect(steps).toContain('noTie');
  });

  it('shows keep-pressure-never-tie for the chest, belly or back', () => {
    expect(ids({ ...base, C3: 'yes', B1: 'torso', B2: 'soaking' })).toContain('noTie');
  });

  it('shows no pressure steps when there is no bleeding', () => {
    const steps = ids({ ...base, C3: 'yes', B1: 'none' });
    expect(steps).not.toContain('press');
    expect(steps).toContain('shock');
  });

  it('shows leave-the-object-in when something is stuck', () => {
    expect(ids({ ...base, C3: 'yes', B1: 'limb', B2: 'ooze', B3: 'slows', B4: 'yes' })).toContain(
      'object',
    );
  });

  it('shows keep-injuries-still for a broken bone or not walking', () => {
    expect(ids({ ...base, C1: 'minor', F3: 'yes' })).toContain('still');
    expect(ids({ ...base, C2: 'no' })).toContain('still');
  });

  it('shows cool-the-burn for any burn', () => {
    expect(ids({ ...base, C1: 'minor', F4: 'small' })).toEqual(['burn']);
  });

  it('shows clean-and-cover for green with nothing else', () => {
    expect(ids({ ...base, C1: 'minor', F1: 'yes', F2: 'no', F3: 'no', F4: 'no' })).toEqual([
      'minor',
    ]);
  });

  it('shows watch-for-shock when it is getting worse', () => {
    expect(ids(base, true)).toEqual(['shock']);
  });

  it('keeps the documented order', () => {
    const steps = ids({
      ...base,
      C1: 'serious',
      C2: 'no',
      C3: 'yes',
      B1: 'limb',
      B2: 'spurting',
      B3: 'no',
      B4: 'yes',
      F1: 'yes',
      F2: 'yes',
      F3: 'yes',
      F4: 'large',
    });
    expect(steps).toEqual(['press', 'hold', 'tourniquet', 'object', 'shock', 'still', 'burn']);
  });
});
