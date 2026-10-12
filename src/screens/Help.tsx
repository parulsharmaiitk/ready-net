import { AnswerButton } from '../components/AnswerButton';
import { InfoBox } from '../components/Card';
import { ChipGroup } from '../components/Chip';
import { useStepFocus } from '../components/useStepFocus';
import { SKILLS } from '../data/questions';
import type { CheckIn } from '../types';

export function HelpStep({
  help,
  onChange,
  onContinue,
}: {
  help: CheckIn['help'];
  onChange: (help: CheckIn['help']) => void;
  onContinue: () => void;
}) {
  const heading = useStepFocus<HTMLHeadingElement>('Willing to help?');
  return (
    <div className="stack">
      <p className="label">Helping</p>
      <h1 className="question" id="help-q" tabIndex={-1} ref={heading}>
        Willing to help?
      </h1>
      <p className="hint">People nearby may need a hand. You choose what you can do.</p>
      <div className="answers" role="group" aria-labelledby="help-q">
        <AnswerButton
          big
          selected={help.willing === true}
          onClick={() => onChange({ ...help, willing: true })}
        >
          Yes
        </AnswerButton>
        <AnswerButton
          big
          selected={help.willing === false}
          onClick={() => {
            onChange({ ...help, willing: false });
            onContinue();
          }}
        >
          Not right now
        </AnswerButton>
      </div>

      {help.willing === true && (
        <>
          <h2 className="subtitle">What can you do?</h2>
          <ChipGroup
            label="Your skills"
            options={SKILLS}
            value={help.skills}
            onChange={(skills) => onChange({ ...help, skills })}
          />
          <InfoBox title="Optional: get a blue card.">
            You can get a blue card at your city hall. It covers you if you're injured while
            helping. You don't need one to help.
          </InfoBox>
          <button type="button" className="btn btn--ink" onClick={onContinue}>
            Continue
          </button>
        </>
      )}
    </div>
  );
}
