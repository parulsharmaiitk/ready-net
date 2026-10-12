import { COLOR_INFO } from '../data/triage';
import type { Color } from '../types';

export function TriageCard({ color }: { color: Color }) {
  const info = COLOR_INFO[color];
  return (
    <section
      className={`triage triage--${color}`}
      aria-label={`Triage color: ${info.word}, ${info.label}`}
    >
      <p className="label">Your triage color</p>
      <p className="triage__word">{info.word}</p>
      <p className="triage__label">{info.label}</p>
      <p className="triage__meaning">{info.meaning}</p>
    </section>
  );
}

export function ColorSwatch({ color }: { color: Color }) {
  return (
    <span
      className="swatch"
      style={{ background: `var(--${color === 'white' ? 'white-card' : color})` }}
      aria-hidden="true"
    />
  );
}
