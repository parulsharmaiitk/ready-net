import { describe, expect, it } from 'vitest';
import { triage } from './triage';

const allNo = {
  C1: 'no',
  C2: 'yes',
  C3: 'no',
  C4: 'yes',
  C5: 'no',
  E1: 'no',
  E2: 'no',
  E3: 'no',
  E4: 'no',
  E5: 'no',
  E6: 'no',
  L1: 'yes',
  L2: 'yes',
};

describe('triage', () => {
  it('is white when nothing is wrong', () => {
    expect(triage(allNo, false)).toBe('white');
  });

  it('is white with no answers', () => {
    expect(triage({}, false)).toBe('white');
  });

  it('is red for "Seriously" injured', () => {
    expect(triage({ ...allNo, C1: 'serious' }, false)).toBe('red');
  });

  it('is yellow for "Yes, but it can wait"', () => {
    expect(triage({ ...allNo, C1: 'wait' }, false)).toBe('yellow');
  });

  it('is green for "Minor injury" alone', () => {
    expect(triage({ ...allNo, C1: 'minor', F1: 'yes', F2: 'no', F3: 'no', F4: 'no' }, false)).toBe(
      'green',
    );
  });

  it('is yellow when you cannot walk', () => {
    expect(triage({ ...allNo, C2: 'no' }, false)).toBe('yellow');
  });

  it('is red for breathing trouble / heavy bleeding', () => {
    expect(triage({ ...allNo, C3: 'yes' }, false)).toBe('red');
  });

  it('is red when medicine or care is needed now', () => {
    expect(triage({ ...allNo, C5: 'now' }, false)).toBe('red');
    expect(triage({ ...allNo, C5: 'day' }, false)).toBe('white');
  });

  it('takes the worst answer among follow-ups', () => {
    expect(triage({ ...allNo, C1: 'minor', F4: 'blisters' }, false)).toBe('yellow');
    expect(triage({ ...allNo, C1: 'minor', F1: 'confused' }, false)).toBe('red');
  });

  it('turns any result red when it is getting worse', () => {
    expect(triage(allNo, true)).toBe('red');
    expect(triage({ ...allNo, C1: 'minor' }, true)).toBe('red');
  });

  it('ignores answers from branches that were skipped', () => {
    // F-questions answered earlier, then C1 changed to "No".
    expect(triage({ ...allNo, F1: 'unresponsive', F2: 'yes' }, false)).toBe('white');
  });

  it('ignores surroundings and loved-ones answers', () => {
    expect(triage({ ...allNo, E1: 'yes', E2: 'yes', L1: 'no' }, false)).toBe('white');
  });
});
