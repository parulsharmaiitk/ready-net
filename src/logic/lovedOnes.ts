import type { Answers } from '../types';

/** What the result screen's loved-ones tile says, based on the user's own L1/L2 answers. */
export function lovedOnesShareText(answers: Answers): string {
  const status = answers.L1 === 'yes';
  const location = answers.L2 === 'yes';
  if (status && location) return 'Status + location shared';
  if (status) return 'Status shared';
  if (location) return 'Location shared';
  return 'Notified you checked in';
}
