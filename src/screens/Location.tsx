import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { useStepFocus } from '../components/useStepFocus';
import type { CheckIn } from '../types';

type Loc = CheckIn['location'];
type GpsState = { kind: 'locating' } | { kind: 'found' } | { kind: 'error'; message: string };

function gpsError(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) return 'Location permission was denied.';
  if (err.code === err.TIMEOUT) return 'Finding your location took too long.';
  return 'Your location is not available right now.';
}

export function LocationStep({
  location,
  onChange,
  onContinue,
}: {
  location: Loc;
  onChange: (patch: Partial<Loc>) => void;
  onContinue: () => void;
}) {
  const heading = useStepFocus<HTMLHeadingElement>('Where are you?');
  const [gps, setGps] = useState<GpsState>(() =>
    'geolocation' in navigator
      ? { kind: 'locating' }
      : { kind: 'error', message: 'This device cannot share its location.' },
  );

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: Math.round(pos.coords.accuracy),
        });
        setGps({ kind: 'found' });
      },
      (err) => !cancelled && setGps({ kind: 'error', message: gpsError(err) }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasCoords = location.lat !== undefined && location.lng !== undefined;
  const canContinue = hasCoords || !!location.text?.trim();

  return (
    <div className="stack">
      <p className="label">Your location</p>
      <h1 className="question" tabIndex={-1} ref={heading}>
        Where are you?
      </h1>
      <p className="hint">
        Responders use this to find you. It stays on this device until it can be sent.
      </p>

      <div className="card status-line" role="status">
        {gps.kind === 'locating' && (
          <>
            <Icon name="pin" />
            <div>
              <strong>Finding your location…</strong>
              {hasCoords && <p className="small">Last known: {fmt(location)}</p>}
            </div>
          </>
        )}
        {gps.kind === 'found' && hasCoords && (
          <>
            <span style={{ color: 'var(--green)' }}>
              <Icon name="checkCircle" />
            </span>
            <div>
              <strong>GPS location found</strong>
              <p className="small">
                {fmt(location)}
                {location.accuracyM ? ` · ±${location.accuracyM} m` : ''}
              </p>
            </div>
          </>
        )}
        {gps.kind === 'error' && (
          <>
            <span style={{ color: 'var(--red)' }}>
              <Icon name="alert" />
            </span>
            <div>
              <strong>{gps.message}</strong>
              <p className="small">
                {hasCoords
                  ? `Using your last location: ${fmt(location)}`
                  : 'Add an address or landmark below.'}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="field">
        <label htmlFor="loc-text">Address or landmark</label>
        <input
          id="loc-text"
          className="input"
          type="text"
          autoComplete="street-address"
          placeholder="e.g. 5th & Main, blue house"
          value={location.text ?? ''}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>

      <button type="button" className="btn btn--ink" disabled={!canContinue} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

export function fmt(l: Loc): string {
  return l.lat !== undefined && l.lng !== undefined
    ? `${l.lat.toFixed(3)}, ${l.lng.toFixed(3)}`
    : '';
}
