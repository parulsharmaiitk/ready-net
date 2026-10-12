import { AnswerButton } from '../components/AnswerButton';
import { useStepFocus } from '../components/useStepFocus';
import { SECTION_TITLES, type Question } from '../data/questions';

export function QuestionStep({
  question,
  selected,
  position,
  onAnswer,
}: {
  question: Question;
  selected?: string;
  position: string;
  onAnswer: (optionId: string) => void;
}) {
  const heading = useStepFocus<HTMLHeadingElement>(
    `${SECTION_TITLES[question.section]}, ${position}. ${question.text}`,
  );
  const headingId = `q-${question.id}`;
  return (
    <div className="stack">
      <p className="label">{SECTION_TITLES[question.section]}</p>
      <h1 className="question" id={headingId} tabIndex={-1} ref={heading}>
        {question.text}
      </h1>
      {question.hint && <p className="hint">{question.hint}</p>}
      <div className="answers" role="group" aria-labelledby={headingId}>
        {question.options.map((o) => (
          <AnswerButton key={o.id} selected={selected === o.id} onClick={() => onAnswer(o.id)}>
            {o.label}
          </AnswerButton>
        ))}
      </div>
    </div>
  );
}
