import { QUESTIONS_BY_ID, SURROUNDINGS_IDS } from '../data/questions';
import type { Answers } from '../types';

export interface AreaRisk {
  level: 'high' | 'low';
  rescueAlert: boolean;
  hazards: string[];
}

const RAISES_RISK = ['E1', 'E2', 'E3', 'E4'];

/**
 * Area risk from this device's answers.
 *
 * With no backend there is a single report per zone. A real build would pool many reports per zone
 * and require several independent reports before marking a zone high-risk.
 */
export function areaRisk(answers: Answers): AreaRisk {
  const hazards = SURROUNDINGS_IDS.filter((id) => answers[id] === 'yes').map(
    (id) => QUESTIONS_BY_ID[id].hazardLabel ?? id,
  );
  const high = RAISES_RISK.some((id) => answers[id] === 'yes');
  return { level: high ? 'high' : 'low', rescueAlert: answers.E1 === 'yes', hazards };
}
