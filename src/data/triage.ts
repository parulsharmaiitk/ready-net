import type { Color } from '../types';

export const COLOR_INFO: Record<Color, { word: string; label: string; meaning: string }> = {
  red: {
    word: 'Red',
    label: 'Seriously injured',
    meaning: 'Responders and nearby medical helpers have been alerted.',
  },
  yellow: {
    word: 'Yellow',
    label: 'Injured, not urgent',
    meaning: 'Help is coming — stay put and follow the steps below.',
  },
  green: {
    word: 'Green',
    label: 'Walking wounded',
    meaning: 'Minor injuries — head to the nearest cache or aid station when safe.',
  },
  white: {
    word: 'White',
    label: 'Not injured',
    meaning: "You're safe — consider sharing supplies or helping nearby.",
  },
};
