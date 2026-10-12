export type Section = 'about' | 'bleeding' | 'injury' | 'surroundings' | 'loved';

export interface QuestionOption {
  id: string;
  label: string;
  /** 3 = red, 2 = yellow, 1 = green, 0 = white; undefined = no effect on color. */
  score?: number;
}

export interface Question {
  id: string;
  section: Section;
  text: string;
  hint?: string;
  options: QuestionOption[];
  /** Surroundings only. */
  hazard?: 'critical' | 'high' | 'medium';
  /** Short name used when listing hazards. */
  hazardLabel?: string;
}

export const SECTION_TITLES: Record<Section, string> = {
  about: 'About you',
  bleeding: 'Bleeding',
  injury: 'Injury',
  surroundings: 'Your surroundings',
  loved: 'Loved ones',
};

const yes = (score?: number): QuestionOption => ({ id: 'yes', label: 'Yes', score });
const no = (score?: number): QuestionOption => ({ id: 'no', label: 'No', score });

export const QUESTIONS: Question[] = [
  // About you
  {
    id: 'C1',
    section: 'about',
    text: 'Are you injured?',
    options: [
      { id: 'serious', label: 'Seriously', score: 3 },
      { id: 'wait', label: 'Yes, but it can wait', score: 2 },
      { id: 'minor', label: 'Minor injury', score: 1 },
      no(0),
    ],
  },
  { id: 'C2', section: 'about', text: 'Can you walk on your own?', options: [yes(0), no(2)] },
  {
    id: 'C3',
    section: 'about',
    text: 'Any trouble breathing, chest pain or heavy bleeding?',
    options: [yes(3), no(0)],
  },
  {
    id: 'C4',
    section: 'about',
    text: 'Do you have safe water and food for the next 24 hours?',
    options: [yes(), no()],
  },
  {
    id: 'C5',
    section: 'about',
    text: "Do you or someone with you need medicine, oxygen or care you don't have?",
    options: [
      { id: 'now', label: 'Yes, needed now', score: 3 },
      { id: 'day', label: 'Within a day' },
      no(),
    ],
  },

  // Bleeding follow-ups
  {
    id: 'B1',
    section: 'bleeding',
    text: 'Where is the bleeding?',
    options: [
      { id: 'limb', label: 'Arm or leg' },
      { id: 'head', label: 'Head or neck' },
      { id: 'torso', label: 'Chest, belly or back' },
      { id: 'none', label: 'No bleeding — breathing or chest pain only', score: 3 },
    ],
  },
  {
    id: 'B2',
    section: 'bleeding',
    text: 'What does the bleeding look like?',
    options: [
      { id: 'spurting', label: 'Spurting or pulsing', score: 3 },
      { id: 'soaking', label: 'Steady flow that soaks a cloth', score: 3 },
      { id: 'ooze', label: 'Slow ooze or seeping', score: 1 },
    ],
  },
  {
    id: 'B3',
    section: 'bleeding',
    text: 'Does it slow down when you press firmly on it?',
    hint: 'Press hard with a clean cloth for a few minutes, then answer.',
    options: [
      { id: 'slows', label: 'Yes, it slows or stops', score: 2 },
      { id: 'no', label: 'No, it keeps bleeding', score: 3 },
    ],
  },
  {
    id: 'B4',
    section: 'bleeding',
    text: 'Is something stuck in the wound?',
    options: [yes(2), no()],
  },

  // Injury follow-ups
  {
    id: 'F1',
    section: 'injury',
    text: 'Is the injured person awake and able to talk normally?',
    options: [
      yes(),
      { id: 'confused', label: 'Confused or very sleepy', score: 3 },
      { id: 'unresponsive', label: 'Not responding', score: 3 },
    ],
  },
  {
    id: 'F2',
    section: 'injury',
    text: 'Are they pale, cold, sweaty or breathing fast?',
    options: [yes(3), no()],
  },
  { id: 'F3', section: 'injury', text: 'Do you think a bone is broken?', options: [yes(2), no()] },
  {
    id: 'F4',
    section: 'injury',
    text: 'Is there a burn?',
    options: [
      no(),
      { id: 'small', label: 'Small and red', score: 1 },
      { id: 'blisters', label: 'Blisters', score: 2 },
      { id: 'large', label: 'Large, white or charred', score: 3 },
    ],
  },

  // Your surroundings
  {
    id: 'E1',
    section: 'surroundings',
    text: 'Is anyone trapped near you?',
    options: [yes(), no(), { id: 'unsure', label: 'Not sure' }],
    hazard: 'critical',
    hazardLabel: 'Someone trapped',
  },
  {
    id: 'E2',
    section: 'surroundings',
    text: 'Do you see fire or smoke, or smell gas?',
    options: [yes(), no()],
    hazard: 'high',
    hazardLabel: 'Fire, smoke or gas',
  },
  {
    id: 'E3',
    section: 'surroundings',
    text: 'Are buildings near you collapsed or badly cracked?',
    options: [yes(), no()],
    hazard: 'high',
    hazardLabel: 'Collapsed or damaged buildings',
  },
  {
    id: 'E4',
    section: 'surroundings',
    text: 'Is there flooding or rising water?',
    options: [yes(), no()],
    hazard: 'high',
    hazardLabel: 'Flooding',
  },
  {
    id: 'E5',
    section: 'surroundings',
    text: 'Are power lines down or is the power out?',
    options: [yes(), no()],
    hazard: 'medium',
    hazardLabel: 'Power lines down or power out',
  },
  {
    id: 'E6',
    section: 'surroundings',
    text: 'Are roads near you blocked or impassable?',
    options: [yes(), no()],
    hazard: 'medium',
    hazardLabel: 'Blocked roads',
  },

  // Loved ones
  {
    id: 'L1',
    section: 'loved',
    text: 'Do you want your loved ones to know your condition?',
    hint: 'Linked loved ones are told you checked in either way.',
    options: [yes(), no()],
  },
  {
    id: 'L2',
    section: 'loved',
    text: 'Do you want your loved ones to know your location?',
    options: [yes(), no()],
  },
];

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const ABOUT_IDS = ['C1', 'C2', 'C3', 'C4', 'C5'];
export const BLEEDING_IDS = ['B1', 'B2', 'B3', 'B4'];
export const INJURY_IDS = ['F1', 'F2', 'F3', 'F4'];
export const SURROUNDINGS_IDS = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
export const LOVED_IDS = ['L1', 'L2'];

export const SKILLS = [
  'Medical field',
  'First aid / CPR',
  'Search & rescue',
  'Construction',
  'Translation',
  'Driving',
  'Childcare / elder care',
];

export const SUPPLIES = [
  'Water',
  'Food',
  'First-aid kit',
  'Blankets',
  'Phone chargers',
  'Baby supplies',
  'Medicine',
  'Tools',
];
