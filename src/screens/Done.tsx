import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { ColorSwatch } from '../components/TriageCard';
import { useOnline } from '../components/useOnline';
import { useStepFocus } from '../components/useStepFocus';
import { COLOR_INFO } from '../data/triage';
import { CACHES } from '../logic/caches';
import { lovedOnesShareText } from '../logic/lovedOnes';
import { getCheckIn } from '../store/checkins';
import { onChange } from '../store/db';
import type { CheckIn } from '../types';

/** Live send status for a saved check-in. */
export function useSavedStatus(id: string): CheckIn['status'] | undefined {
  const [status, setStatus] = useState<CheckIn['status']>();
  useEffect(() => {
    const load = () => void getCheckIn(id).then((c) => setStatus(c?.status));
    load();
    return onChange('checkins', load);
  }, [id]);
  return status;
}

export function SendStatus({ status }: { status?: CheckIn['status'] }) {
  const online = useOnline();
  if (status === 'sent') {
    return (
      <div className="banner banner--ok" role="status">
        <Icon name="checkCircle" />
        <div className="banner__body">
          <strong>Sent</strong>
        </div>
      </div>
    );
  }
  return (
    <div className="banner banner--info" role="status">
      <Icon name={online ? 'clock' : 'wifiOff'} />
      <div className="banner__body">
        <strong>{online ? 'Sending…' : 'Saved — will send when online'}</strong>
      </div>
    </div>
  );
}

export function DoneStep({ checkIn, onAgain }: { checkIn: CheckIn; onAgain: () => void }) {
  const heading = useStepFocus<HTMLHeadingElement>('Checked in.');
  const status = useSavedStatus(checkIn.id);
  const color = checkIn.color ?? 'white';
  const cache = CACHES.find((c) => c.id === checkIn.bringing?.cacheId);

  return (
    <div className="stack">
      <div className="row" style={{ color: 'var(--green)' }}>
        <span style={{ width: 40, height: 40, display: 'inline-flex' }}>
          <Icon name="checkCircle" />
        </span>
        <h1 className="title" tabIndex={-1} ref={heading} style={{ color: 'var(--ink)' }}>
          Checked in
        </h1>
      </div>

      <SendStatus status={status} />

      <section className="card">
        <dl className="summary">
          <dt>Status</dt>
          <dd>
            <ColorSwatch color={color} />
            {COLOR_INFO[color].word} — {COLOR_INFO[color].label}
          </dd>
          <dt>Area</dt>
          <dd>{checkIn.risk === 'high' ? 'High risk' : 'Low risk'}</dd>
          <dt>Loved ones</dt>
          <dd>{lovedOnesShareText(checkIn.answers)}</dd>
          <dt>Helping</dt>
          <dd>
            {checkIn.help.willing
              ? `Yes${checkIn.help.skills.length ? ` — ${checkIn.help.skills.join(', ')}` : ''}`
              : 'Not right now'}
          </dd>
          <dt>Bringing</dt>
          <dd>
            {checkIn.bringing?.items.length
              ? `${checkIn.bringing.items.join(', ')}${cache ? ` to ${cache.name}` : ''}`
              : 'Nothing'}
          </dd>
        </dl>
      </section>

      <button type="button" className="btn btn--action" onClick={onAgain}>
        Check in again
      </button>
    </div>
  );
}
