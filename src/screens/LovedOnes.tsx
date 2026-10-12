import { useEffect, useState, type FormEvent } from 'react';
import { CacheMap } from '../components/CacheMap';
import { DemoTag } from '../components/Card';
import { Icon } from '../components/Icon';
import { ColorSwatch } from '../components/TriageCard';
import { useStepFocus } from '../components/useStepFocus';
import { APP_NAME } from '../config';
import { DEMO_SHARE_VARIANTS } from '../data/demoLovedOnes';
import { COLOR_INFO } from '../data/triage';
import { notify } from '../pwa/notifications';
import { announce } from '../pwa/bus';
import { onChange } from '../store/db';
import { listLovedOnes, removeLovedOne, saveLovedOne } from '../store/lovedOnes';
import { getSettings, updateSettings, useSettings } from '../store/settings';
import type { Color, LovedOne } from '../types';
import { timeAgo } from './Home';

const COLORS: Color[] = ['red', 'yellow', 'green', 'white'];

/** Demo: the loved one checks in. Only the parts they chose to share are kept. */
async function simulateCheckIn(person: LovedOne): Promise<void> {
  const s = getSettings();
  const share = DEMO_SHARE_VARIANTS[s.demoShareIndex % DEMO_SHARE_VARIANTS.length];
  updateSettings({ demoShareIndex: s.demoShareIndex + 1 });
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const position = {
    x: 15 + Math.round(Math.random() * 70),
    y: 15 + Math.round(Math.random() * 70),
  };
  const lastCheckIn: LovedOne['lastCheckIn'] = {
    at: new Date().toISOString(),
    ...(share.status ? { color } : {}),
    ...(share.location ? { position } : {}),
  };
  await saveLovedOne({ ...person, lastCheckIn });

  const parts: string[] = [];
  if (lastCheckIn.color)
    parts.push(`Status: ${COLOR_INFO[color].word} — ${COLOR_INFO[color].label}.`);
  if (lastCheckIn.position) parts.push('Location shared.');
  await notify(
    `${person.name} checked in on ${APP_NAME}`,
    parts.join(' ') || 'They chose not to share details.',
    {
      url: '#/loved',
      tag: `loved-${person.id}`,
      actionLabel: 'View',
    },
  );
}

function PersonCard({ person, demoMode }: { person: LovedOne; demoMode: boolean }) {
  const ci = person.lastCheckIn;
  const first = person.name.split(' ')[0];
  return (
    <li className="card person">
      <div className="person__head">
        <div>
          <p className="person__name">{person.name}</p>
          <p className="small">{person.contact}</p>
        </div>
        {person.state === 'pending' ? (
          <span className="state state--pending">
            <Icon name="clock" />
            Waiting for them to verify
          </span>
        ) : (
          <span className="state state--active">
            <Icon name="checkCircle" />
            Linked
          </span>
        )}
      </div>

      {ci && (
        <div className="stack stack--sm">
          <p className="label">Checked in · {timeAgo(ci.at)}</p>
          {ci.color && (
            <p className="subtitle">
              <ColorSwatch color={ci.color} />
              {COLOR_INFO[ci.color].word} — {COLOR_INFO[ci.color].label}
            </p>
          )}
          {ci.position && (
            <CacheMap
              caches={[]}
              showRiskZone={false}
              showUser={false}
              others={[{ id: person.id, label: person.name, ...ci.position }]}
              label={`Map showing where ${person.name} checked in`}
            />
          )}
          {!ci.color && !ci.position && (
            <p className="small">{first} checked in but chose not to share details.</p>
          )}
        </div>
      )}

      <div className="row">
        {demoMode && person.state === 'pending' && (
          <button
            type="button"
            className="btn btn--demo btn--small"
            onClick={() => {
              void saveLovedOne({ ...person, state: 'active' });
              announce(`${person.name} verified. Link is active.`);
            }}
          >
            <DemoTag /> Simulate: they verified
          </button>
        )}
        {demoMode && person.state === 'active' && (
          <button
            type="button"
            className="btn btn--demo btn--small"
            onClick={() => void simulateCheckIn(person)}
          >
            <DemoTag /> Simulate: {first} checked in
          </button>
        )}
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            if (window.confirm(`Remove the link with ${person.name}?`)) {
              void removeLovedOne(person.id);
              announce(`Removed ${person.name}.`);
            }
          }}
        >
          Remove link
        </button>
      </div>
    </li>
  );
}

export function LovedOnes() {
  const heading = useStepFocus<HTMLHeadingElement>('Loved ones');
  const { demoMode } = useSettings();
  const [people, setPeople] = useState<LovedOne[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    const load = () => void listLovedOnes().then(setPeople);
    load();
    return onChange('lovedOnes', load);
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    await saveLovedOne({
      id: crypto.randomUUID(),
      name: name.trim(),
      contact: contact.trim(),
      state: 'pending',
    });
    announce(`Invite sent to ${name.trim()}. Waiting for them to verify.`);
    setName('');
    setContact('');
    setAdding(false);
  }

  return (
    <div className="stack">
      <h1 className="title" tabIndex={-1} ref={heading}>
        Loved ones
      </h1>
      <p className="body">
        Linked loved ones are told when you check in. You choose whether they also see your
        condition and location. Both of you must verify before a link is active, and either of you
        can remove it.
      </p>

      {people.length === 0 && !adding && <p className="small">No one linked yet.</p>}
      {people.length > 0 && (
        <ul className="stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {people.map((p) => (
            <PersonCard key={p.id} person={p} demoMode={demoMode} />
          ))}
        </ul>
      )}

      {adding ? (
        <form className="card stack" onSubmit={(e) => void add(e)}>
          <h2 className="subtitle">Add loved one</h2>
          <div className="field">
            <label htmlFor="lo-name">Name</label>
            <input
              id="lo-name"
              className="input"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="lo-contact">Phone or email</label>
            <input
              id="lo-contact"
              className="input"
              inputMode="email"
              autoComplete="off"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <p className="small">We'll ask them to verify. Nothing is shared until you both have.</p>
          <button type="submit" className="btn btn--ink">
            Send invite
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button type="button" className="btn btn--ink" onClick={() => setAdding(true)}>
          <Icon name="plus" />
          Add loved one
        </button>
      )}
    </div>
  );
}
