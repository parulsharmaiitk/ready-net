import { useState } from 'react';
import { Icon } from '../components/Icon';
import { InstallButton } from '../components/InstallButton';
import { useStepFocus } from '../components/useStepFocus';
import { APP_NAME } from '../config';
import { announce } from '../pwa/bus';
import { notificationPermission } from '../pwa/notifications';
import { deleteAllData } from '../store/deleteAll';
import { updateSettings, useSettings } from '../store/settings';

const PERMISSION_TEXT: Record<string, string> = {
  granted: 'On',
  denied: 'Blocked — alerts show inside the app instead',
  default: 'Not asked yet — we ask the first time a demo needs it',
  unsupported: 'Not supported — alerts show inside the app instead',
};

export function Settings() {
  const heading = useStepFocus<HTMLHeadingElement>('Settings');
  const { demoMode } = useSettings();
  const [deleted, setDeleted] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete all ${APP_NAME} data on this device? This can't be undone.`))
      return;
    await deleteAllData();
    setDeleted(true);
    announce('All your data was deleted.');
  }

  return (
    <div className="stack">
      <h1 className="title" tabIndex={-1} ref={heading}>
        Settings
      </h1>

      <section className="card stack stack--sm">
        <label className="toggle">
          <span>
            <strong>Demo mode</strong>
            <span className="small" style={{ display: 'block' }}>
              Shows the buttons that simulate alerts and other people.
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={demoMode}
            onChange={(e) => updateSettings({ demoMode: e.target.checked })}
          />
        </label>
        <hr className="divider" />
        <div>
          <strong>Notifications</strong>
          <p className="small">{PERMISSION_TEXT[notificationPermission()]}</p>
        </div>
      </section>

      <InstallButton />

      <section className="card stack stack--sm" aria-labelledby="privacy-h">
        <h2 className="subtitle" id="privacy-h">
          Your data
        </h2>
        <p className="body">
          Everything stays on this device. In this prototype nothing is sent anywhere — sending to
          responders is simulated.
        </p>
        <button type="button" className="btn btn--red" onClick={() => void onDelete()}>
          <Icon name="trash" />
          Delete all my data
        </button>
        {deleted && (
          <p className="small" role="status">
            All data deleted.
          </p>
        )}
      </section>

      <p className="small">
        {APP_NAME} prototype · v{__APP_VERSION__}. First-aid wording is a placeholder pending EMS
        review.
      </p>
    </div>
  );
}
