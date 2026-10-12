import { RISK_ZONE, USER_POSITION, type CacheView } from '../logic/caches';

interface Props {
  caches: CacheView[];
  showRiskZone: boolean;
  highlightId?: string;
  /** Loved ones' pins, if they shared their location. */
  others?: { id: string; label: string; x: number; y: number }[];
  showUser?: boolean;
  label: string;
}

// Stylised SVG map in a 100 x 75 coordinate space (cache positions are 0–100 on both axes).
const W = 100;
const H = 75;
const sy = (y: number) => (y / 100) * H;

const BLOCKS: [number, number, number, number][] = [
  [3, 3, 20, 14],
  [27, 3, 18, 14],
  [49, 3, 14, 14],
  [67, 3, 30, 14],
  [3, 21, 20, 16],
  [27, 21, 18, 16],
  [49, 21, 14, 16],
  [67, 21, 14, 16],
  [85, 21, 12, 16],
  [3, 41, 20, 13],
  [27, 41, 36, 13],
  [67, 41, 30, 13],
  [3, 58, 20, 14],
  [27, 58, 18, 14],
  [49, 58, 14, 14],
  [67, 58, 30, 14],
];

function Pin({ x, y, fill, ring }: { x: number; y: number; fill: string; ring?: boolean }) {
  return (
    <g transform={`translate(${x} ${sy(y)})`}>
      {ring && <circle cy="-5.6" r="5" fill="none" stroke="#12212E" strokeWidth="0.8" />}
      <path
        d="M0 0c-2.4-2.6-3.6-4.4-3.6-6a3.6 3.6 0 0 1 7.2 0c0 1.6-1.2 3.4-3.6 6z"
        fill={fill}
        stroke="#fff"
        strokeWidth="0.6"
      />
      <rect x="-1.3" y="-7.3" width="2.6" height="2.6" rx="0.4" fill="#fff" />
    </g>
  );
}

export function CacheMap({
  caches,
  showRiskZone,
  highlightId,
  others = [],
  showUser = true,
  label,
}: Props) {
  return (
    <div className="map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <rect width={W} height={H} fill="#E9EDF1" />
        {BLOCKS.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="1.2" fill="#D5DDE4" />
        ))}
        <rect x="27" y="41" width="36" height="13" rx="1.2" fill="#CFE3D1" />
        {showRiskZone && (
          <ellipse
            cx={RISK_ZONE.x}
            cy={sy(RISK_ZONE.y)}
            rx={RISK_ZONE.r}
            ry={sy(RISK_ZONE.r)}
            fill="rgba(179,38,30,0.12)"
            stroke="#B3261E"
            strokeWidth="0.7"
            strokeDasharray="2 1.4"
          />
        )}
        {caches.map((c) => (
          <Pin
            key={c.id}
            x={c.x}
            y={c.y}
            fill={c.open ? '#1F4E79' : '#7A8794'}
            ring={c.id === highlightId}
          />
        ))}
        {others.map((o) => (
          <g key={o.id} transform={`translate(${o.x} ${sy(o.y)})`}>
            <circle r="2.4" fill="#D9480F" stroke="#fff" strokeWidth="0.7" />
          </g>
        ))}
        {showUser && (
          <g transform={`translate(${USER_POSITION.x} ${sy(USER_POSITION.y)})`}>
            <circle r="4" fill="rgba(217,72,15,0.2)" />
            <circle r="2" fill="#D9480F" stroke="#fff" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function MapLegend({
  showRiskZone,
  showUser = true,
}: {
  showRiskZone: boolean;
  showUser?: boolean;
}) {
  return (
    <div className="legend">
      {showUser && (
        <span>
          <i style={{ background: '#D9480F' }} /> You
        </span>
      )}
      <span>
        <i style={{ background: '#1F4E79' }} /> Open cache
      </span>
      {showRiskZone && (
        <>
          <span>
            <i style={{ background: '#7A8794' }} /> Closed cache
          </span>
          <span>
            <i style={{ border: '2px dashed #B3261E' }} /> High-risk zone
          </span>
        </>
      )}
    </div>
  );
}
