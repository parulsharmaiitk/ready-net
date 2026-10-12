import { AlertBanner } from '../components/Card';
import { Icon } from '../components/Icon';
import { TriageCard } from '../components/TriageCard';
import { useStepFocus } from '../components/useStepFocus';
import { COLOR_INFO } from '../data/triage';
import { FIRST_AID_FOOTER } from '../data/firstAid';
import { firstAid } from '../logic/firstAid';
import { lovedOnesShareText } from '../logic/lovedOnes';
import { areaRisk } from '../logic/risk';
import { triage } from '../logic/triage';
import type { CheckIn } from '../types';

export function ResultStep({
  checkIn,
  onWorse,
  onContinue,
}: {
  checkIn: CheckIn;
  onWorse: () => void;
  onContinue: () => void;
}) {
  const color = triage(checkIn.answers, checkIn.worse);
  const risk = areaRisk(checkIn.answers);
  const steps = firstAid(checkIn.answers, color);
  const info = COLOR_INFO[color];
  const heading = useStepFocus<HTMLHeadingElement>(
    `Check-in saved. Your triage color is ${info.word}, ${info.label}. Area risk ${risk.level}.`,
  );

  return (
    <div className="stack">
      <h1 className="title" tabIndex={-1} ref={heading}>
        Your check-in
      </h1>

      {risk.rescueAlert && (
        <AlertBanner>
          <strong>Rescue alert sent.</strong> Responders have your location and photos for the
          trapped person.
        </AlertBanner>
      )}

      <TriageCard color={color} />

      <div className="tiles">
        <div className={`tile tile--${risk.level}`}>
          <span className="label">Area risk</span>
          <span className="tile__value">{risk.level === 'high' ? 'High' : 'Low'}</span>
          {risk.hazards.length > 0 && (
            <ul>
              {risk.hazards.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="tile">
          <span className="label">Loved ones</span>
          <span className="tile__value">{lovedOnesShareText(checkIn.answers)}</span>
        </div>
      </div>

      {steps.length > 0 && (
        <section className="stack stack--sm" aria-labelledby="aid-heading">
          <h2 className="subtitle" id="aid-heading">
            What you can do while you wait
          </h2>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.id}>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="small">{FIRST_AID_FOOTER}</p>
        </section>
      )}

      {color !== 'white' &&
        (checkIn.worse ? (
          <div className="banner banner--info" role="status">
            <Icon name="bell" />
            <div className="banner__body">
              <strong>Alert sent again.</strong> Your status is now Red. Stay where you are if it's
              safe.
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn--red" onClick={onWorse}>
            <Icon name="alert" />
            It's getting worse — alert again
          </button>
        ))}

      <button type="button" className="btn btn--ink" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
