import { getCheckIn, saveCheckIn } from '../store/checkins';
import { useLastCheckIn } from './Home';
import { CachesView } from './CachesView';

/** Caches tab: uses the area risk and location from the last check-in (low risk if none). */
export function Caches() {
  const last = useLastCheckIn();
  if (last === null) return <p className="body">Loading…</p>;
  return (
    <CachesView
      risk={last?.risk ?? 'low'}
      location={last?.location}
      bringing={last?.bringing ?? null}
      onBring={async (bringing) => {
        if (!last) return;
        const saved = await getCheckIn(last.id);
        if (saved) await saveCheckIn({ ...saved, bringing });
      }}
    />
  );
}
