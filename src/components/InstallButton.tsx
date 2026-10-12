import { useInstall } from '../pwa/install';
import { Icon } from './Icon';

export function InstallButton() {
  const { canInstall, showIOSHint, install } = useInstall();
  if (canInstall) {
    return (
      <button type="button" className="btn btn--ghost" onClick={() => void install()}>
        <Icon name="download" />
        Install app
      </button>
    );
  }
  if (showIOSHint) {
    return <p className="small">To install: tap Share &gt; Add to Home Screen.</p>;
  }
  return null;
}
