import { describe, expect, it } from 'vitest';
import { activeAnswers, flowSteps, isQuestionStep, nextQuestionIds, progress } from './flow';

const E = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
const C = ['C1', 'C2', 'C3', 'C4', 'C5'];

describe('nextQuestionIds', () => {
  it('asks only the core questions when not injured and no bleeding', () => {
    expect(nextQuestionIds({ C1: 'no', C3: 'no' })).toEqual([...C, ...E, 'L1', 'L2']);
  });

  it('asks B1–B4 when C3 = Yes', () => {
    expect(nextQuestionIds({ C1: 'no', C3: 'yes' })).toEqual([
      ...C,
      'B1',
      'B2',
      'B3',
      'B4',
      ...E,
      'L1',
      'L2',
    ]);
  });

  it('skips B2–B4 when B1 is "No bleeding"', () => {
    expect(nextQuestionIds({ C1: 'no', C3: 'yes', B1: 'none' })).toEqual([
      ...C,
      'B1',
      ...E,
      'L1',
      'L2',
    ]);
  });

  it('asks F1–F4 when C1 is not "No", after the bleeding questions', () => {
    expect(nextQuestionIds({ C1: 'minor', C3: 'yes', B1: 'limb' })).toEqual([
      ...C,
      'B1',
      'B2',
      'B3',
      'B4',
      'F1',
      'F2',
      'F3',
      'F4',
      ...E,
      'L1',
      'L2',
    ]);
  });

  it('skips F1–F4 when C1 = No', () => {
    expect(nextQuestionIds({ C1: 'no' })).not.toContain('F1');
  });
});

describe('activeAnswers', () => {
  it('drops answers from branches that are no longer on the path', () => {
    const answers = { C1: 'no', C3: 'yes', B1: 'none', B2: 'spurting', F2: 'yes' };
    expect(activeAnswers(answers)).toEqual({ C1: 'no', C3: 'yes', B1: 'none' });
  });
});

describe('flowSteps', () => {
  it('places photos between surroundings and loved ones, then the result screens', () => {
    const steps = flowSteps({ C1: 'no', C3: 'no' });
    expect(steps[0]).toBe('location');
    expect(steps.slice(steps.indexOf('E6'))).toEqual([
      'E6',
      'photos',
      'L1',
      'L2',
      'result',
      'help',
      'caches',
      'done',
    ]);
  });

  it('knows which steps are questions', () => {
    expect(isQuestionStep('C1')).toBe(true);
    expect(isQuestionStep('photos')).toBe(false);
  });

  it('reports progress up to the result', () => {
    const answers = { C1: 'no', C3: 'no' };
    expect(progress(answers, 'location')).toEqual({ index: 0, total: 15 });
    expect(progress(answers, 'L2').index).toBe(14);
    expect(progress(answers, 'done').index).toBe(15);
  });
});
