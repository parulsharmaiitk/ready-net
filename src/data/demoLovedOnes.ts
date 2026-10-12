// Sample data for the "Simulate: [name] checked in" demo. Cycles through every sharing combination,
// including one where the loved one shared neither condition nor location.
export const DEMO_SHARE_VARIANTS: { status: boolean; location: boolean }[] = [
  { status: true, location: true },
  { status: true, location: false },
  { status: false, location: false },
  { status: false, location: true },
];

export const DEMO_SUGGESTED_LOVED_ONES = [
  { name: 'Sam Rivera', contact: '+1 555 0142' },
  { name: 'Mom', contact: 'mom@example.com' },
];
