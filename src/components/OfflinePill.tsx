import { useOnline } from './useOnline';

export function OfflinePill() {
  const online = useOnline();
  return (
    <span className={`pill ${online ? 'pill--online' : 'pill--offline'}`} role="status">
      <span className="pill__dot" aria-hidden="true" />
      {online ? 'Online' : 'Offline'}
    </span>
  );
}
