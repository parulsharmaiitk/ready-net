import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DemoTag } from '../components/Card';
import { Icon } from '../components/Icon';
import { InstallButton } from '../components/InstallButton';
import { ColorSwatch } from '../components/TriageCard';
import { useStepFocus } from '../components/useStepFocus';
import { APP_NAME } from '../config';
import { COLOR_INFO } from '../data/triage';
import { notify } from '../pwa/notifications';
import { lastCheckIn } from '../store/checkins';
import { onChange } from '../store/db';
import { useSettings } from '../store/settings';
import type { CheckIn } from '../types';
import { SendStatus } from './Done';

export function useLastCheckIn(): CheckIn | undefined | null {
  const [last, setLast] = useState<CheckIn | undefined | null>(null);
  useEffect(() => {
    const load = () => void lastCheckIn().then((c) => setLast(c?.completedAt ? c : undefined));
    load();
    return onChange('checkins', load);
  }, []);
  return last;
}

export function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Date(iso).toLocaleDateString();
}

export function triggerEarthquakeDemo(): Promise<void> {
  return notify(
    'Earthquake reported in your area',
    'Tap to check in and tell responders how you are.',
    {
      url: '#/alert',
      tone: 'alert',
      tag: 'quake',
      actionLabel: 'Open alert',
    },
  );
}

export function Home() {
  const heading = useStepFocus<HTMLHeadingElement>(`${APP_NAME} home`);
  const last = useLastCheckIn();
  const { demoMode } = useSettings();

  return (
    <div className="stack">
      <h1 className="title" tabIndex={-1} ref={heading}>
        Are you safe?
      </h1>
      <p className="body">
        After a disaster, check in so responders know how you are. It takes about a minute and works
        without a connection.
      </p>

      <Link to="/checkin?new=1" className="btn btn--action">
        <Icon name="checkCircle" />
        Check in now
      </Link>

      {last && (
        <section className="card stack stack--sm" aria-labelledby="last-h">
          <p className="label" id="last-h">
            Last check-in · {timeAgo(last.completedAt!)}
          </p>
          <p className="subtitle">
            <ColorSwatch color={last.color ?? 'white'} />
            {COLOR_INFO[last.color ?? 'white'].word} — {COLOR_INFO[last.color ?? 'white'].label}
          </p>
          <p className="small">Area risk: {last.risk === 'high' ? 'High' : 'Low'}</p>
          <SendStatus status={last.status} />
        </section>
      )}

      <InstallButton />

      {demoMode && (
        <section className="stack stack--sm" aria-labelledby="demo-h">
          <h2 className="small" id="demo-h" style={{ fontWeight: 700 }}>
            <DemoTag /> Try the alert a resident would get
          </h2>
          <button
            type="button"
            className="btn btn--demo"
            onClick={() => void triggerEarthquakeDemo()}
          >
            <Icon name="bell" />
            Demo: trigger earthquake alert
          </button>
        </section>
      )}
    </div>
  );
}
