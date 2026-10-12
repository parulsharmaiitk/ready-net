import { Icon } from './Icon';

export function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" className="chip" aria-pressed={selected} onClick={onToggle}>
      {selected && <Icon name="check" />}
      {label}
    </button>
  );
}

export function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <Chip
          key={o}
          label={o}
          selected={value.includes(o)}
          onToggle={() =>
            onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
          }
        />
      ))}
    </div>
  );
}
