// Placeholder wording — to be reviewed by EMS partners. Edit text here; the rules live in src/logic/firstAid.ts.
export const FIRST_AID_TEXT = {
  press: {
    title: 'Press hard on the wound',
    text: "Use a clean cloth, shirt or towel and press firmly with both hands. Don't lift it to check; add more cloth on top if blood soaks through.",
  },
  hold: {
    title: 'Hold the pressure in place',
    text: 'Wrap a strip of blanket, a scarf or clothing tightly around the cloth so pressure stays on if you need your hands free.',
  },
  tourniquet: {
    title: 'Arm or leg still bleeding?',
    text: "Tie a belt or blanket strip tightly 2–3 inches above the wound, not on a joint. Twist it with a stick until the bleeding stops, note the time, and don't loosen it. Tell responders it's there.",
  },
  noTie: {
    title: 'Keep pressure, never tie',
    text: 'Keep firm pressure with cloth. Never tie anything around the neck.',
  },
  object: {
    title: 'Leave the object in',
    text: "Don't pull it out. Pad cloth around it and press around the object, not on it.",
  },
  shock: {
    title: 'Watch for shock',
    text: 'If the person is pale, cold or breathing fast, have them lie down and keep them warm with a blanket. No food or drink if badly hurt.',
  },
  still: {
    title: 'Keep injuries still',
    text: "Don't try to straighten a limb that may be broken. Support it with rolled clothes or blankets.",
  },
  burn: {
    title: 'Cool the burn',
    text: 'Cool with clean, cool running water for at least 10 minutes, then cover loosely with a clean cloth. No ice, butter or creams.',
  },
  minor: {
    title: 'Clean and cover minor wounds',
    text: 'Rinse with clean water if you have it and cover with a clean cloth.',
  },
} as const;

export type FirstAidId = keyof typeof FIRST_AID_TEXT;

export const FIRST_AID_FOOTER = "Help has been requested. These steps don't replace medical care.";
