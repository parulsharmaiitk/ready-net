import {
  ABOUT_IDS,
  BLEEDING_IDS,
  INJURY_IDS,
  LOVED_IDS,
  SURROUNDINGS_IDS,
} from '../data/questions';
import type { Answers } from '../types';

/** The dynamic question order for the given answers. Branches that don't apply are left out. */
export function nextQuestionIds(answers: Answers): string[] {
  const ids = [...ABOUT_IDS];
  if (answers.C3 === 'yes') {
    ids.push('B1');
    if (answers.B1 !== 'none') ids.push(...BLEEDING_IDS.slice(1));
  }
  if (answers.C1 !== undefined && answers.C1 !== 'no') ids.push(...INJURY_IDS);
  ids.push(...SURROUNDINGS_IDS, ...LOVED_IDS);
  return ids;
}

/** Only the answers to questions that are still on the path (skipped branches don't count). */
export function activeAnswers(answers: Answers): Answers {
  const active: Answers = {};
  for (const id of nextQuestionIds(answers)) {
    if (answers[id] !== undefined) active[id] = answers[id];
  }
  return active;
}

export type FlowStep = string; // 'location' | 'photos' | 'result' | 'help' | 'caches' | 'done' | a question id

export const NON_QUESTION_STEPS = [
  'location',
  'photos',
  'result',
  'help',
  'caches',
  'done',
] as const;

/** Every screen of the check-in, in order. Photos sit between the surroundings and loved-ones questions. */
export function flowSteps(answers: Answers): FlowStep[] {
  const questions = nextQuestionIds(answers);
  const lovedStart = questions.indexOf(LOVED_IDS[0]);
  return [
    'location',
    ...questions.slice(0, lovedStart),
    'photos',
    ...questions.slice(lovedStart),
    'result',
    'help',
    'caches',
    'done',
  ];
}

export function isQuestionStep(step: FlowStep): boolean {
  return !(NON_QUESTION_STEPS as readonly string[]).includes(step);
}

/** Position of a step within the part of the flow covered by the progress bar (location → last question). */
export function progress(answers: Answers, step: FlowStep): { index: number; total: number } {
  const steps = flowSteps(answers);
  const total = steps.indexOf('result');
  return { index: Math.min(steps.indexOf(step), total), total };
}
