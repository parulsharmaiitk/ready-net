import { QUESTIONS_BY_ID } from '../data/questions';
import type { Answers, Color } from '../types';
import { activeAnswers } from './flow';

const COLORS_BY_SCORE: Color[] = ['white', 'green', 'yellow', 'red'];

/** Worst answer wins: the highest score among answered questions on the current path. */
export function triage(answers: Answers, worse: boolean): Color {
  if (worse) return 'red';
  let max = 0;
  for (const [qid, optionId] of Object.entries(activeAnswers(answers))) {
    const score = QUESTIONS_BY_ID[qid]?.options.find((o) => o.id === optionId)?.score;
    if (score !== undefined && score > max) max = score;
  }
  return COLORS_BY_SCORE[Math.min(max, 3)];
}
