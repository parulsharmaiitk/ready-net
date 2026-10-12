import { useEffect, useMemo, useState } from 'react';
import { CacheMap, MapLegend } from '../components/CacheMap';
import { ChipGroup } from '../components/Chip';
import { Icon } from '../components/Icon';
import { useStepFocus } from '../components/useStepFocus';
import { SUPPLIES } from '../data/questions';
import { cachesFor, mergeSupplies } from '../logic/caches';
import { getSettings, updateSettings, useSettings } from '../store/settings';
import type { CheckIn } from '../types';
import { fmt } from './Location';

interface Props {
  risk: 'high' | 'low';
  location?: CheckIn['location'];
  bringing: CheckIn['bringing'];
  onBring: (b: NonNullable<CheckIn['bringing']>) => void;
  /** In the check-in flow: show Continue. */
  onContinue?: () => void;
  headingLevel?: 'h1';
  title?: string;
}

/** Add pledged items to a cache's local list (kept on this device). */
export function pledge(cacheId: string, items: string[], previous?: CheckIn['bringing']): void {
  const all = { ...getSettings().cacheContributions };
  if (previous) {
    all[previous.cacheId] = (all[previous.cacheId] ?? []).filter(
      (i) => !previous.items.includes(i),
    );
  }
  all[cacheId] = mergeSupplies(all[cacheId] ?? [], items);
  updateSettings({ cacheContributions: all });
}

export function CachesView({
  risk,
  location,
  bringing,
  onBring,
  onContinue,
  title = 'Supply caches',
}: Props) {
  const heading = useStepFocus<HTMLHeadingElement>(`${title}. Area risk ${risk}.`);
  const settings = useSettings();
  const caches = useMemo(() => cachesFor(risk), [risk]);
  const nearest = caches.find((c) => c.open);
  const [items, setItems] = useState<string[]>(bringing?.items ?? []);
  const [confirmed, setConfirmed] = useState<boolean>(!!bringing?.items.length);

  useEffect(() => {
    setItems(bringing?.items ?? []);
    setConfirmed(!!bringing?.items.length);
  }, [bringing]);

  const mine = nearest ? (settings.cacheContributions[nearest.id] ?? []) : [];
  const coords = location ? fmt(location) : '';

  return (
    <div className="stack">
      <h1 className="title" tabIndex={-1} ref={heading}>
        {title}
      </h1>
      <p className="body">City-run sites where neighbors share supplies.</p>

      <CacheMap
        caches={caches}
        showRiskZone={risk === 'high'}
        highlightId={nearest?.id}
        label={`Map of ${caches.length} supply caches around you. ${
          risk === 'high' ? 'One cache is closed in a high-risk zone.' : 'All caches are open.'
        }`}
      />
      <MapLegend showRiskZone={risk === 'high'} />
      {coords && <p className="small">Your GPS location: {coords}</p>}

      {nearest && (
        <section className="card stack stack--sm" aria-labelledby="nearest-h">
          <p className="label">Nearest open cache · {nearest.distanceMi} mi</p>
          <h2 className="subtitle" id="nearest-h">
            {nearest.name}
          </h2>
          <p className="small">{nearest.type}</p>
          <h3 className="small" style={{ fontWeight: 700, color: 'var(--ink)' }}>
            Supplies shared by neighbors
          </h3>
          <ul className="chips" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {nearest.supplies.map((s) => (
              <li key={s} className="chip chip--static">
                {s}
              </li>
            ))}
            {mine
              .filter((s) => !nearest.supplies.includes(s))
              .map((s) => (
                <li key={`mine-${s}`} className="chip chip--static chip--mine">
                  {s} (you)
                </li>
              ))}
          </ul>
          <h3 className="small" style={{ fontWeight: 700, color: 'var(--ink)' }}>
            Needed
          </h3>
          <ul className="chips" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {nearest.needed.map((s) => (
              <li key={s} className="chip chip--static chip--needed">
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="stack stack--sm" aria-labelledby="all-caches-h">
        <h2 className="subtitle" id="all-caches-h">
          All caches
        </h2>
        <ul className="cache-list">
          {caches.map((c) => (
            <li key={c.id}>
              <div>
                <strong>{c.name}</strong>
                <p className="small">{c.type}</p>
              </div>
              {c.open ? (
                <span className="small" style={{ whiteSpace: 'nowrap' }}>
                  {c.distanceMi} mi
                </span>
              ) : (
                <span className="closed">Closed — high-risk zone</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {nearest && (
        <section className="stack stack--sm" aria-labelledby="bring-h">
          <h2 className="subtitle" id="bring-h">
            What can you bring to share?
          </h2>
          <ChipGroup
            label="Supplies you can bring"
            options={SUPPLIES}
            value={items}
            onChange={(v) => {
              setItems(v);
              setConfirmed(false);
            }}
          />
          {confirmed && items.length > 0 ? (
            <div className="banner banner--ok" role="status">
              <Icon name="checkCircle" />
              <div className="banner__body">
                <strong>
                  I'm bringing {items.length} item{items.length === 1 ? '' : 's'}
                </strong>{' '}
                to {nearest.name}.
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={items.length === 0}
              onClick={() => {
                pledge(nearest.id, items, bringing);
                onBring({ cacheId: nearest.id, items });
                setConfirmed(true);
              }}
            >
              {items.length === 0
                ? 'Pick what you can bring'
                : `Bring ${items.length} item${items.length === 1 ? '' : 's'}`}
            </button>
          )}
        </section>
      )}

      {onContinue && (
        <button type="button" className="btn btn--ink" onClick={onContinue}>
          Continue
        </button>
      )}
    </div>
  );
}
