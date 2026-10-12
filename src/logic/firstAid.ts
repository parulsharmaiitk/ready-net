import { FIRST_AID_TEXT, type FirstAidId } from '../data/firstAid';
import type { AidStep, Answers, Color } from '../types';
import { activeAnswers } from './flow';

const BODY_AREAS = ['limb', 'head', 'torso'];

/** First-aid steps to show while waiting, in display order. None for white. */
export function firstAid(allAnswers: Answers, color: Color): AidStep[] {
  if (color === 'white') return [];
  const a = activeAnswers(allAnswers);
  const ids: FirstAidId[] = [];

  const bleeding = a.C3 === 'yes' && BODY_AREAS.includes(a.B1);
  if (bleeding) ids.push('press', 'hold');
  if (a.B1 === 'limb' && (a.B2 === 'spurting' || a.B2 === 'soaking' || a.B3 === 'no')) {
    ids.push('tourniquet');
  }
  if (a.B1 === 'head' || a.B1 === 'torso') ids.push('noTie');
  if (a.B4 === 'yes') ids.push('object');
  if (a.F2 === 'yes' || color === 'red' || color === 'yellow') ids.push('shock');
  if (a.F3 === 'yes' || a.C2 === 'no') ids.push('still');
  if (a.F4 !== undefined && a.F4 !== 'no') ids.push('burn');
  if (color === 'green' && ids.length === 0) ids.push('minor');

  return ids.map((id) => ({ id, ...FIRST_AID_TEXT[id] }));
}
