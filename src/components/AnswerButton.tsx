import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  big?: boolean;
}

export function AnswerButton({ selected = false, onClick, children, big }: Props) {
  return (
    <button
      type="button"
      className={`answer${big ? ' answer--big' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span>{children}</span>
      {selected ? <Icon name="check" /> : <Icon name="chevron" />}
    </button>
  );
}
